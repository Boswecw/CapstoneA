// server/models/Pet.js - Enhanced version with additional features
const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    type: {
      type: String,
      required: [true, 'Pet type is required'],
      enum: ["dog", "cat", "fish", "bird", "small-pet", "supply"],
      lowercase: true,
      index: true // Add index for faster queries
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true,
      maxlength: [50, 'Breed cannot exceed 50 characters']
    },
    age: {
      type: String,
      required: [true, 'Age is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function(v) {
          return v >= 0;
        },
        message: 'Price must be a positive number'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      default: '/images/default-pet.jpg'
    },
    images: [{
      type: String,
      validate: {
        validator: function(v) {
          return /^\/images\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid image URL format'
      }
    }], // Additional images
    available: {
      type: Boolean,
      default: true,
      index: true // Add index for faster queries
    },
    featured: {
      type: Boolean,
      default: false,
      index: true // Add index for featured pets
    },
    votes: {
      up: { type: Number, default: 0, min: 0 },
      down: { type: Number, default: 0, min: 0 },
    },
    ratings: [
      {
        user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User",
          required: true
        },
        rating: { 
          type: Number, 
          min: [1, 'Rating must be at least 1'], 
          max: [5, 'Rating cannot exceed 5'],
          required: true
        },
        comment: {
          type: String,
          trim: true,
          maxlength: [500, 'Comment cannot exceed 500 characters']
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    size: {
      type: String,
      enum: ["small", "medium", "large", "extra-large"],
      lowercase: true,
      required: function () {
        // Only require size for animals, not supplies
        return this.type !== "supply";
      },
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      lowercase: true,
      required: function () {
        // Only require gender for dogs, cats, birds, and small-pets
        // NOT for fish or supplies
        return ["dog", "cat", "bird", "small-pet"].includes(this.type);
      },
    },
    // Additional useful fields
    characteristics: [{
      type: String,
      trim: true,
      maxlength: [30, 'Characteristic cannot exceed 30 characters']
    }], // e.g., ["friendly", "house-trained", "good with kids"]
    
    healthInfo: {
      vaccinated: { type: Boolean, default: false },
      spayed: { type: Boolean, default: false },
      microchipped: { type: Boolean, default: false },
      specialNeeds: { 
        type: String, 
        trim: true,
        maxlength: [200, 'Special needs description too long']
      }
    },
    
    location: {
      shelter: { 
        type: String, 
        default: 'FurBabies Main Location',
        trim: true
      },
      city: { type: String, default: 'Louisville', trim: true },
      state: { type: String, default: 'KY', trim: true }
    },
    
    adoptionStatus: {
      type: String,
      enum: ["available", "pending", "adopted", "hold"],
      default: "available",
      index: true
    },
    
    adoptionFee: {
      type: Number,
      min: [0, 'Adoption fee cannot be negative'],
      default: function() {
        return this.price; // Use price as default adoption fee
      }
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Tracking fields
    views: { type: Number, default: 0, min: 0 },
    favoriteCount: { type: Number, default: 0, min: 0 },
    
    // SEO and search optimization
    tags: [{
      type: String,
      lowercase: true,
      trim: true
    }], // e.g., ["puppy", "large-breed", "family-friendly"]
    
    // For supply items
    inStock: {
      type: Boolean,
      default: true,
      required: function() {
        return this.type === "supply";
      }
    },
    
    stockQuantity: {
      type: Number,
      min: [0, 'Stock quantity cannot be negative'],
      default: function() {
        return this.type === "supply" ? 0 : undefined;
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for average rating (your existing code)
petSchema.virtual("averageRating").get(function () {
  if (this.ratings.length === 0) return 0;
  const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return (total / this.ratings.length).toFixed(1);
});

// Virtual for total ratings count
petSchema.virtual("totalRatings").get(function () {
  return this.ratings.length;
});

// Virtual for vote score (up votes - down votes)
petSchema.virtual("voteScore").get(function () {
  return (this.votes.up || 0) - (this.votes.down || 0);
});

// Virtual for popularity score (combination of views, ratings, and votes)
petSchema.virtual("popularityScore").get(function () {
  const ratingScore = parseFloat(this.averageRating) * this.totalRatings;
  const voteScore = this.voteScore;
  const viewScore = this.views * 0.1;
  return ratingScore + voteScore + viewScore;
});

// Indexes for better performance
petSchema.index({ type: 1, available: 1 });
petSchema.index({ featured: 1, available: 1 });
petSchema.index({ price: 1 });
petSchema.index({ createdAt: -1 });
petSchema.index({ adoptionStatus: 1 });

// Text index for search functionality
petSchema.index({ 
  name: 'text', 
  breed: 'text', 
  description: 'text',
  characteristics: 'text',
  tags: 'text'
});

// Compound indexes for common queries
petSchema.index({ type: 1, size: 1, available: 1 });
petSchema.index({ type: 1, price: 1 });

// Pre-save middleware for additional processing
petSchema.pre('save', function(next) {
  // Auto-generate tags based on pet info
  if (this.isNew || this.isModified(['name', 'breed', 'type', 'size'])) {
    this.tags = this.tags || [];
    
    // Add type-specific tags
    if (!this.tags.includes(this.type)) {
      this.tags.push(this.type);
    }
    
    // Add size tag
    if (this.size && !this.tags.includes(this.size)) {
      this.tags.push(this.size);
    }
    
    // Add breed-related tags
    const breedWords = this.breed.toLowerCase().split(' ');
    breedWords.forEach(word => {
      if (word.length > 2 && !this.tags.includes(word)) {
        this.tags.push(word);
      }
    });
  }
  
  // Update availability based on adoption status
  if (this.adoptionStatus === 'adopted') {
    this.available = false;
  }
  
  next();
});

// Static methods for common queries
petSchema.statics.findAvailable = function() {
  return this.find({ available: true, adoptionStatus: 'available' });
};

petSchema.statics.findFeatured = function() {
  return this.find({ featured: true, available: true });
};

petSchema.statics.findByType = function(type) {
  return this.find({ type: type, available: true });
};

petSchema.statics.findPopular = function() {
  return this.find({ available: true })
    .sort({ views: -1, 'votes.up': -1 })
    .limit(10);
};

// Instance methods
petSchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  return this.save();
};

petSchema.methods.addToFavorites = function() {
  this.favoriteCount = (this.favoriteCount || 0) + 1;
  return this.save();
};

petSchema.methods.removeFromFavorites = function() {
  this.favoriteCount = Math.max(0, (this.favoriteCount || 0) - 1);
  return this.save();
};

module.exports = mongoose.model("Pet", petSchema);