const express = require('express');
const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');
const { asyncHandler, AppError } = require('../middleware/errorMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get comments for a post (public)
router.get('/post/:postId', optionalAuth, [
  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20, parentId = null } = req.query;

  // Check if post exists
  const post = await BlogPost.findById(postId);
  if (!post || post.status !== 'published' || !post.isActive) {
    throw new AppError('Post not found', 404);
  }

  // Get pinned comments first
  const pinnedComments = await Comment.findPinned(postId);

  // Get regular comments
  const regularComments = await Comment.findByPost(postId, {
    parentId: parentId || null,
    limit: limit - pinnedComments.length,
    sort: parentId ? 1 : -1 // Ascending for replies, descending for top-level
  });

  // Combine pinned and regular comments
  const allComments = [...pinnedComments, ...regularComments];

  // Get user's reactions if authenticated
  let userReactions = {};
  if (req.user) {
    for (const comment of allComments) {
      userReactions[comment._id] = comment.getUserReaction(req.user._id);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      comments: allComments,
      userReactions: req.user ? userReactions : null,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: regularComments.length === limit - pinnedComments.length
      }
    }
  });
}));

// Get replies for a comment
router.get('/:commentId/replies', optionalAuth, asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const parentComment = await Comment.findById(commentId);
  if (!parentComment || !parentComment.isActive || parentComment.isDeleted) {
    throw new AppError('Comment not found', 404);
  }

  const replies = await Comment.getReplies(commentId);

  // Get user's reactions if authenticated
  let userReactions = {};
  if (req.user) {
    for (const reply of replies) {
      userReactions[reply._id] = reply.getUserReaction(req.user._id);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      comments: replies,
      userReactions: req.user ? userReactions : null
    }
  });
}));

// Create new comment
router.post('/', protect, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  body('postId').isMongoId().withMessage('Valid post ID is required'),
  body('parentId').optional().isMongoId().withMessage('Valid parent comment ID is required')
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

  const { content, postId, parentId } = req.body;

  // Check if post exists and is published
  const post = await BlogPost.findById(postId);
  if (!post || post.status !== 'published' || !post.isActive) {
    throw new AppError('Post not found', 404);
  }

  // Check parent comment if provided
  if (parentId) {
    const parentComment = await Comment.findById(parentId);
    if (!parentComment || parentComment.isDeleted || !parentComment.isActive) {
      throw new AppError('Parent comment not found', 404);
    }

    // Check depth limit
    if (parentComment.depth >= 3) {
      throw new AppError('Maximum reply depth reached', 400);
    }
  }

  // Create comment
  const comment = await Comment.create({
    content,
    author: req.user._id,
    post: postId,
    parent: parentId || null,
    depth: parentId ? (await Comment.findById(parentId)).depth + 1 : 0
  });

  // Populate comment data
  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'name profilePicture')
    .populate('parent', 'content author');

  // Update post comment count
  await Comment.updatePostCommentCount(postId);

  // Emit real-time update
  req.app.get('io').emit('commentCreated', {
    comment: populatedComment,
    postId,
    parentId
  });

  res.status(201).json({
    success: true,
    data: populatedComment
  });
}));

// Update comment
router.put('/:commentId', protect, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted || !comment.isActive) {
    throw new AppError('Comment not found', 404);
  }

  // Check ownership or admin rights
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to edit this comment', 403);
  }

  // Update comment
  comment.content = content;
  comment.isEdited = true;
  comment.editedAt = new Date();
  
  if (req.user.role === 'admin') {
    comment.moderatedBy = req.user._id;
  }

  await comment.save();

  // Populate updated comment
  const updatedComment = await Comment.findById(commentId)
    .populate('author', 'name profilePicture')
    .populate('moderatedBy', 'name');

  // Emit real-time update
  req.app.get('io').emit('commentUpdated', {
    comment: updatedComment,
    editedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: updatedComment
  });
}));

// Delete comment (soft delete)
router.delete('/:commentId', protect, asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted || !comment.isActive) {
    throw new AppError('Comment not found', 404);
  }

  // Check ownership or admin rights
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this comment', 403);
  }

  // Soft delete
  await comment.softDelete(req.user._id);

  // Update post comment count
  await Comment.updatePostCommentCount(comment.post);

  // Emit real-time update
  req.app.get('io').emit('commentDeleted', {
    commentId,
    postId: comment.post,
    deletedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
}));

// Pin/Unpin comment (admin only)
router.patch('/:commentId/pin', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { isPinned } = req.body;

  if (typeof isPinned !== 'boolean') {
    throw new AppError('isPinned must be a boolean value', 400);
  }

  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted || !comment.isActive) {
    throw new AppError('Comment not found', 404);
  }

  comment.isPinned = isPinned;
  await comment.save();

  const updatedComment = await Comment.findById(commentId)
    .populate('author', 'name profilePicture');

  // Emit real-time update
  req.app.get('io').emit('commentPinned', {
    comment: updatedComment,
    isPinned,
    pinnedBy: req.user._id
  });

  res.status(200).json({
    success: true,
    data: updatedComment,
    message: `Comment ${isPinned ? 'pinned' : 'unpinned'} successfully`
  });
}));

// Like/Dislike comment
router.post('/:commentId/react', protect, [
  body('reaction').isIn(['like', 'dislike']).withMessage('Reaction must be either like or dislike')
], asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { reaction } = req.body;

  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted || !comment.isActive) {
    throw new AppError('Comment not found', 404);
  }

  // Get current user reaction
  const currentReaction = comment.getUserReaction(req.user._id);

  // Update reaction
  if (reaction === 'like') {
    await comment.addLike(req.user._id);
  } else {
    await comment.addDislike(req.user._id);
  }

  // Get updated comment
  const updatedComment = await Comment.findById(commentId)
    .populate('author', 'name profilePicture');

  // Emit real-time update
  req.app.get('io').emit('commentReaction', {
    commentId,
    userId: req.user._id,
    reaction,
    previousReaction: currentReaction,
    likesCount: updatedComment.likesCount,
    dislikesCount: updatedComment.dislikesCount
  });

  res.status(200).json({
    success: true,
    data: {
      likesCount: updatedComment.likesCount,
      dislikesCount: updatedComment.dislikesCount,
      userReaction: reaction
    }
  });
}));

// Remove reaction
router.delete('/:commentId/react', protect, asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment || comment.isDeleted || !comment.isActive) {
    throw new AppError('Comment not found', 404);
  }

  // Get current reaction
  const currentReaction = comment.getUserReaction(req.user._id);

  if (!currentReaction) {
    throw new AppError('No reaction to remove', 400);
  }

  // Remove reaction
  await comment.removeReaction(req.user._id);

  // Get updated comment
  const updatedComment = await Comment.findById(commentId);

  // Emit real-time update
  req.app.get('io').emit('commentReactionRemoved', {
    commentId,
    userId: req.user._id,
    previousReaction: currentReaction,
    likesCount: updatedComment.likesCount,
    dislikesCount: updatedComment.dislikesCount
  });

  res.status(200).json({
    success: true,
    data: {
      likesCount: updatedComment.likesCount,
      dislikesCount: updatedComment.dislikesCount,
      userReaction: null
    }
  });
}));

// Get user's comments
router.get('/user/:userId', optionalAuth, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const comments = await Comment.findByUser(userId, {
    limit: parseInt(limit)
  });

  res.status(200).json({
    success: true,
    data: comments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
}));

// Get comment statistics
router.get('/stats/post/:postId', asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // Check if post exists
  const post = await BlogPost.findById(postId);
  if (!post || post.status !== 'published' || !post.isActive) {
    throw new AppError('Post not found', 404);
  }

  const stats = await Comment.aggregate([
    { $match: { post: new mongoose.Types.ObjectId(postId), isActive: true, isDeleted: false } },
    {
      $group: {
        _id: null,
        totalComments: { $sum: 1 },
        totalLikes: { $sum: { $size: '$likes' } },
        totalDislikes: { $sum: { $size: '$dislikes' } },
        pinnedComments: { $sum: { $cond: ['$isPinned', 1, 0] } }
      }
    }
  ]);

  const result = stats[0] || {
    totalComments: 0,
    totalLikes: 0,
    totalDislikes: 0,
    pinnedComments: 0
  };

  res.status(200).json({
    success: true,
    data: result
  });
}));

module.exports = router;
