const express = require('express');
const Canteen = require('../models/Canteen');
const { protect, authorize, canteenOwnerOnly, checkOwnershipOrAdmin } = require('../middleware/authMiddleware');
const { asyncHandler, AppError } = require('../middleware/errorMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all canteens (public)
router.get('/', asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    isOpen,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  if (isOpen !== undefined) {
    query.isOpen = isOpen === 'true';
  }

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const canteens = await Canteen.find(query)
    .populate('owner', 'name profilePicture')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-__v');

  const total = await Canteen.countDocuments(query);

  res.status(200).json({
    success: true,
    data: canteens,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get single canteen (public)
router.get('/:id', asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id)
    .populate('owner', 'name profilePicture')
    .select('-__v');

  if (!canteen || !canteen.isActive) {
    throw new AppError('Canteen not found', 404);
  }

  res.status(200).json({
    success: true,
    data: canteen
  });
}));

// Create new canteen (canteen owner or admin only)
router.post('/', protect, authorize('canteen_owner', 'admin'), [
  body('name').trim().notEmpty().withMessage('Canteen name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('building').trim().notEmpty().withMessage('Building name is required')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  // Check if user already owns a canteen (unless admin)
  if (req.user.role === 'canteen_owner') {
    const existingCanteen = await Canteen.findOne({ owner: req.user._id });
    if (existingCanteen) {
      throw new AppError('You already own a canteen', 400);
    }
  }

  const canteen = await Canteen.create({
    ...req.body,
    owner: req.user._id
  });

  // Update user with owned canteen
  if (req.user.role === 'canteen_owner') {
    await require('../models/User').findByIdAndUpdate(req.user._id, {
      ownedCanteen: canteen._id
    });
  }

  const populatedCanteen = await Canteen.findById(canteen._id)
    .populate('owner', 'name profilePicture');

  // Emit real-time update
  req.app.get('io').emit('canteenCreated', populatedCanteen);

  res.status(201).json({
    success: true,
    data: populatedCanteen
  });
}));

// Update canteen (owner or admin only)
router.put('/:id', protect, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('building').optional().trim().notEmpty().withMessage('Building name cannot be empty')
], asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);

  if (!canteen) {
    throw new AppError('Canteen not found', 404);
  }

  // Check ownership
  if (req.user.role !== 'admin' && canteen.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this canteen', 403);
  }

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  // Update canteen
  const updatedCanteen = await Canteen.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('owner', 'name profilePicture');

  // Emit real-time update
  req.app.get('io').emit('canteenUpdated', updatedCanteen);

  res.status(200).json({
    success: true,
    data: updatedCanteen
  });
}));

// Toggle canteen status (owner or admin only)
router.patch('/:id/status', protect, canteenOwnerOnly, asyncHandler(async (req, res) => {
  const { isOpen } = req.body;

  if (typeof isOpen !== 'boolean') {
    throw new AppError('isOpen must be a boolean value', 400);
  }

  const canteen = await Canteen.findById(req.params.id);

  if (!canteen) {
    throw new AppError('Canteen not found', 404);
  }

  // Update status
  canteen.isOpen = isOpen;
  canteen.lastStatusUpdate = new Date();
  await canteen.save();

  const updatedCanteen = await Canteen.findById(canteen._id)
    .populate('owner', 'name profilePicture');

  // Emit real-time status update
  req.app.get('io').emit('canteenStatusChanged', {
    canteenId: canteen._id,
    isOpen: isOpen,
    lastStatusUpdate: canteen.lastStatusUpdate,
    canteen: updatedCanteen
  });

  res.status(200).json({
    success: true,
    data: updatedCanteen,
    message: `Canteen status changed to ${isOpen ? 'Open' : 'Closed'}`
  });
}));

// Delete canteen (owner or admin only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);

  if (!canteen) {
    throw new AppError('Canteen not found', 404);
  }

  // Check ownership
  if (req.user.role !== 'admin' && canteen.owner.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this canteen', 403);
  }

  // Soft delete - set isActive to false
  canteen.isActive = false;
  await canteen.save();

  // Remove canteen reference from user
  await require('../models/User').findByIdAndUpdate(canteen.owner, {
    ownedCanteen: null
  });

  // Emit real-time update
  req.app.get('io').emit('canteenDeleted', {
    canteenId: canteen._id,
    message: 'Canteen has been removed'
  });

  res.status(200).json({
    success: true,
    message: 'Canteen deleted successfully'
  });
}));

// Get canteen statistics (owner or admin only)
router.get('/:id/stats', protect, canteenOwnerOnly, asyncHandler(async (req, res) => {
  const canteen = await Canteen.findById(req.params.id);

  if (!canteen) {
    throw new AppError('Canteen not found', 404);
  }

  // Get related statistics
  const BlogPost = require('../models/BlogPost');
  const Comment = require('../models/Comment');

  const [postsCount, commentsCount, avgRating] = await Promise.all([
    BlogPost.countDocuments({ canteen: canteen._id, status: 'published', isActive: true }),
    Comment.countDocuments({ 
      post: { $in: await BlogPost.find({ canteen: canteen._id }).distinct('_id') },
      isActive: true,
      isDeleted: false
    }),
    Canteen.aggregate([
      { $match: { _id: canteen._id } },
      { $project: { averageRating: '$rating.average' } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      postsCount,
      commentsCount,
      averageRating: avgRating[0]?.averageRating || 0,
      totalViews: canteen.views || 0,
      lastStatusUpdate: canteen.lastStatusUpdate
    }
  });
}));

// Get my owned canteen (canteen owner only)
router.get('/my/canteen', protect, authorize('canteen_owner'), asyncHandler(async (req, res) => {
  const canteen = await Canteen.findOne({ owner: req.user._id, isActive: true })
    .populate('owner', 'name profilePicture');

  if (!canteen) {
    throw new AppError('You do not own any canteen', 404);
  }

  res.status(200).json({
    success: true,
    data: canteen
  });
}));

// Search canteens
router.get('/search/:query', asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;

  const canteens = await Canteen.searchByName(query)
    .limit(limit)
    .populate('owner', 'name profilePicture');

  res.status(200).json({
    success: true,
    data: canteens
  });
}));

// Get canteen categories
router.get('/categories/list', asyncHandler(async (req, res) => {
  const categories = await Canteen.distinct('category');
  
  res.status(200).json({
    success: true,
    data: categories
  });
}));

module.exports = router;
