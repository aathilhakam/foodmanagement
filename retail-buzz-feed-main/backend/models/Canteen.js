const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
  // Basic canteen information
  name: {
    type: String,
    required: [true, 'Canteen name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Location information
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  building: {
    type: String,
    required: [true, 'Building name is required'],
    maxlength: [50, 'Building name cannot exceed 50 characters']
  },
  floor: {
    type: String,
    maxlength: [20, 'Floor cannot exceed 20 characters']
  },
  
  // Coordinates for map integration
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  
  // Canteen status
  isOpen: {
    type: Boolean,
    default: false,
    index: true // For filtering open/closed canteens
  },
  
  // Operating hours
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  
  // Contact information
  contact: {
    phone: {
      type: String,
      match: [/^[+]?[\d\s\-()]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String, maxlength: [100, 'Alt text cannot exceed 100 characters'] },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Rating and reviews
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Menu items count (for quick reference)
  menuItemsCount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Owner information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Canteen type/category
  category: {
    type: String,
    enum: ['main_canteen', 'faculty_canteen', 'juice_bar', 'cafe', 'snack_bar', 'other'],
    default: 'main_canteen'
  },
  
  // Features and amenities
  features: [{
    type: String,
    enum: ['wifi', 'air_conditioning', 'seating_area', 'takeaway', 'delivery', 'card_payment', 'vegetarian_options']
  }],
  
  // Social media links
  social: {
    facebook: String,
    instagram: String,
    website: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last status update timestamp
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
canteenSchema.virtual('isCurrentlyOpen').get(function() {
  if (!this.isOpen) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleLowerCase('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  if (this.operatingHours[currentDay] && this.operatingHours[currentDay].closed) {
    return false;
  }
  
  if (this.operatingHours[currentDay] && 
      this.operatingHours[currentDay].open && 
      this.operatingHours[currentDay].close) {
    const openTime = this.operatingHours[currentDay].open;
    const closeTime = this.operatingHours[currentDay].close;
    return currentTime >= openTime && currentTime <= closeTime;
  }
  
  return true; // If no specific hours set, assume open when isOpen is true
});

canteenSchema.virtual('primaryImage').get(function() {
  return this.images.find(img => img.isPrimary) || this.images[0];
});

// Indexes for better performance
canteenSchema.index({ name: 1 });
canteenSchema.index({ owner: 1 });
canteenSchema.index({ isOpen: 1 });
canteenSchema.index({ isActive: 1 });
canteenSchema.index({ category: 1 });
canteenSchema.index({ 'rating.average': -1 });
canteenSchema.index({ createdAt: -1 });

// Pre-save middleware
canteenSchema.pre('save', function(next) {
  if (this.isModified('isOpen')) {
    this.lastStatusUpdate = new Date();
  }
  next();
});

// Static methods
canteenSchema.statics.findOpen = function() {
  return this.find({ isOpen: true, isActive: true });
};

canteenSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId, isActive: true });
};

canteenSchema.statics.searchByName = function(searchTerm) {
  return this.find({
    name: { $regex: searchTerm, $options: 'i' },
    isActive: true
  });
};

module.exports = mongoose.model('Canteen', canteenSchema);
