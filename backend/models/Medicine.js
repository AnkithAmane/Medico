const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    // What UI shows
    name: {
      type: String,
      required: [true, 'Please provide medicine name'],
      trim: true,
      unique: true
    },
    category: {
      type: String,
      required: true
      // Analgesic, Antibiotic, Supplement, NSAID, Vitamin, etc.
    },
    description: {
      type: String,
      default: ''
      // e.g. "Relieves fever and mild pain"
    },
    dosage: {
      type: String,
      default: ''
      // e.g. "500mg every 4-6 hours"
    },
    price: {
      type: Number,
      required: true
      // in ₹
    },

    // Inventory
    inStock: {
      type: Boolean,
      default: true
    },
    stockQuantity: {
      type: Number,
      default: 100
    },
    expiryDate: {
      type: Date,
      default: null
    },

    // Medical info
    strength: {
      type: String,
      default: ''
      // e.g. "500mg"
    },
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'powder'],
      default: 'tablet'
    },
    requiresPrescription: {
      type: Boolean,
      default: false
    },
    sideEffects: {
      type: [String],
      default: []
    },
    contraindications: {
      type: [String],
      default: []
    },
    manufacturer: {
      type: String,
      default: ''
    },
    genericName: {
      type: String,
      default: ''
    },

    // Ratings
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },

    // Trust
    isVerified: {
      type: Boolean,
      default: true
      // Verified by Medico+ Pharmacy
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);