const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Comment content
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment cannot be empty'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  // Author information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Post association
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogPost',
    required: true,
    index: true
  },
  
  // Parent comment (for replies)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  
  // Thread/reply depth
  depth: {
    type: Number,
    min: 0,
    max: 3, // Limit to 3 levels of replies
    default: 0
  },
  
  // Moderation features
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date
  },
  
  // Moderation by admin
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  moderationReason: {
    type: String,
    maxlength: [200, 'Moderation reason cannot exceed 200 characters']
  },
  
  // Engagement tracking
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  dislikes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

commentSchema.virtual('dislikesCount').get(function() {
  return this.dislikes.length;
});

commentSchema.virtual('totalEngagement').get(function() {
  return this.likes.length + this.dislikes.length;
});

commentSchema.virtual('isReply').get(function() {
  return !!this.parent;
});

commentSchema.virtual('canEdit').get(function() {
  return !this.isDeleted && this.isActive;
});

// Indexes for better performance
commentSchema.index({ post: 1, isActive: 1, isDeleted: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ isPinned: -1, createdAt: -1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ 'likes.user': 1 });
commentSchema.index({ 'dislikes.user': 1 });

// Compound indexes
commentSchema.index({ post: 1, isPinned: -1, createdAt: -1 });
commentSchema.index({ post: 1, parent: 1, isActive: 1, isDeleted: 1 });

// Pre-save middleware
commentSchema.pre('save', function(next) {
  // Set depth based on parent
  if (this.isModified('parent') && this.parent) {
    this.calculateDepth();
  }
  
  // Mark as edited if content changed
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  
  next();
});

// Instance methods
commentSchema.methods.calculateDepth = async function() {
  if (!this.parent) {
    this.depth = 0;
    return;
  }
  
  try {
    const parentComment = await this.model('Comment').findById(this.parent);
    this.depth = Math.min(parentComment.depth + 1, 3);
  } catch (error) {
    this.depth = 0;
  }
};

commentSchema.methods.addLike = function(userId) {
  // Remove from dislikes if present
  this.dislikes = this.dislikes.filter(dislike => 
    dislike.user.toString() !== userId.toString()
  );
  
  // Add to likes if not already present
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

commentSchema.methods.addDislike = function(userId) {
  // Remove from likes if present
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  
  // Add to dislikes if not already present
  const existingDislike = this.dislikes.find(dislike => 
    dislike.user.toString() === userId.toString()
  );
  
  if (!existingDislike) {
    this.dislikes.push({ user: userId });
  }
  
  return this.save();
};

commentSchema.methods.removeReaction = function(userId) {
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  this.dislikes = this.dislikes.filter(dislike => 
    dislike.user.toString() !== userId.toString()
  );
  
  return this.save();
};

commentSchema.methods.getUserReaction = function(userId) {
  const like = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  if (like) return 'like';
  
  const dislike = this.dislikes.find(dislike => 
    dislike.user.toString() === userId.toString()
  );
  if (dislike) return 'dislike';
  
  return null;
};

commentSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.content = '[This comment has been deleted]';
  return this.save();
};

// Static methods
commentSchema.statics.findByPost = function(postId, options = {}) {
  const query = {
    post: postId,
    isActive: true,
    isDeleted: false
  };
  
  if (options.parentId) {
    query.parent = options.parentId;
  } else {
    query.parent = null; // Only top-level comments
  }
  
  return this.find(query)
    .populate('author', 'name profilePicture')
    .sort({ isPinned: -1, createdAt: options.sort || 1 })
    .limit(options.limit || 50);
};

commentSchema.statics.findPinned = function(postId) {
  return this.find({
    post: postId,
    isPinned: true,
    isActive: true,
    isDeleted: false
  })
  .populate('author', 'name profilePicture')
  .sort({ createdAt: -1 });
};

commentSchema.statics.findByUser = function(userId, options = {}) {
  const query = {
    author: userId,
    isActive: true,
    isDeleted: false
  };
  
  return this.find(query)
    .populate('post', 'title')
    .populate('author', 'name profilePicture')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

commentSchema.statics.getReplies = function(parentId) {
  return this.find({
    parent: parentId,
    isActive: true,
    isDeleted: false
  })
  .populate('author', 'name profilePicture')
  .sort({ createdAt: 1 });
};

commentSchema.statics.updatePostCommentCount = async function(postId) {
  const count = await this.countDocuments({
    post: postId,
    isActive: true,
    isDeleted: false
  });
  
  await mongoose.model('BlogPost').findByIdAndUpdate(postId, {
    commentsCount: count
  });
  
  return count;
};

module.exports = mongoose.model('Comment', commentSchema);
