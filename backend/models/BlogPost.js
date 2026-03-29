const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  // Basic post information
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  
  // Media
  image: {
    type: String,
    default: ''
  },
  
  // Post metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Author information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Canteen association
  canteen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Canteen',
    required: true,
    index: true
  },
  
  // Post status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // Featured/Pinned post
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // SEO and analytics
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Engagement metrics
  views: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Comment count (for quick reference)
  commentsCount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Published date
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
blogPostSchema.virtual('excerptAuto').get(function() {
  if (this.excerpt) return this.excerpt;
  return this.content.substring(0, 150) + '...';
});

// Indexes
blogPostSchema.index({ title: 1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ canteen: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ isPinned: -1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ isActive: 1 });

// Pre-save middleware for slug generation
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static methods
blogPostSchema.statics.findByCanteen = function(canteenId, options = {}) {
  const query = { 
    canteen: canteenId, 
    status: 'published',
    isActive: true 
  };
  
  return this.find(query)
    .populate('author', 'name profilePicture')
    .populate('canteen', 'name')
    .sort({ isPinned: -1, publishedAt: -1 })
    .limit(options.limit || 10);
};

blogPostSchema.statics.findPinned = function(canteenId) {
  return this.find({ 
    canteen: canteenId, 
    isPinned: true, 
    status: 'published',
    isActive: true 
  })
  .populate('author', 'name profilePicture')
  .sort({ publishedAt: -1 });
};

blogPostSchema.statics.search = function(searchTerm) {
  return this.find({
    $and: [
      { status: 'published', isActive: true },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  })
  .populate('author', 'name profilePicture')
  .populate('canteen', 'name')
  .sort({ publishedAt: -1 });
};

module.exports = mongoose.model('BlogPost', blogPostSchema);
