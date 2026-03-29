const express = require('express');
const User = require('../models/User');
const Canteen = require('../models/Canteen');
const { protect, authorize } = require('../middleware/authMiddleware');
const { asyncHandler, AppError } = require('../middleware/errorMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isActive
  } = req.query;

  // Build query
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const users = await User.find(query)
    .select('-password')
    .populate('ownedCanteen', 'name isOpen')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get user by ID (admin only)
router.get('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('ownedCanteen', 'name isOpen');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user
  });
}));

// Update user (admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['user', 'canteen_owner', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
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

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent admin from deactivating themselves
  if (req.user._id.toString() === user._id.toString() && req.body.isActive === false) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password')
  .populate('ownedCanteen', 'name isOpen');

  res.status(200).json({
    success: true,
    data: updatedUser
  });
}));

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent admin from deleting themselves
  if (req.user._id.toString() === user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  // Soft delete - set isActive to false
  user.isActive = false;
  await user.save();

  // If user owns a canteen, deactivate the canteen
  if (user.ownedCanteen) {
    await Canteen.findByIdAndUpdate(user.ownedCanteen, { isActive: false });
  }

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// Get user statistics (admin only)
router.get('/stats/overview', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalCanteenOwners,
    activeCanteenOwners,
    totalAdmins
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'canteen_owner' }),
    User.countDocuments({ role: 'canteen_owner', isActive: true }),
    User.countDocuments({ role: 'admin' })
  ]);

  // Get recent users
  const recentUsers = await User.find({ isActive: true })
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalCanteenOwners,
      activeCanteenOwners,
      totalAdmins,
      recentUsers
    }
  });
}));

// Search users (admin only)
router.get('/search/:query', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { limit = 10 } = req.query;

  const users = await User.find({
    $and: [
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      },
      { isActive: true }
    ]
  })
  .select('-password')
  .populate('ownedCanteen', 'name isOpen')
  .limit(limit);

  res.status(200).json({
    success: true,
    data: users
  });
}));

module.exports = router;
