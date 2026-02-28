const mongoose = require('mongoose');

const zeroKmCarSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    index: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    index: true,
  },
  fuel_type: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
  },
  transmission: {
    type: String,
    required: true,
  },
  colors_available: [{
    type: String,
  }],
  engine: {
    type: String,
  },
  is_new: {
    type: Boolean,
    default: true,
  },
  launch_date: {
    type: Date,
  },
  popularity_score: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String, // URLs of images
  }],
  origin: {
    type: String,
    enum: ['Japonesa', 'Importada'],
    required: true,
    index: true,
  }
}, { timestamps: true });

// Create compound index for sorting combinations
zeroKmCarSchema.index({ brand: 1, price: 1 });
zeroKmCarSchema.index({ brand: 1, year: -1 });

module.exports = mongoose.model('ZeroKmCar', zeroKmCarSchema);
