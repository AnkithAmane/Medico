const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, 'Please provide medicine name'],
      unique: true,
    },
    genericName: String,
    manufacturer: String,
    category: {
      type: String,
      enum: ['antibiotic', 'painkiller', 'vitamin', 'antacid', 'cough', 'cold', 'other'],
      default: 'other',
    },
    strength: String, // e.g., "500mg"
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'powder'],
      default: 'tablet',
    },
    price: {
      type: Number,
      required: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    expiryDate: Date,
    sideEffects: [String],
    contraindications: [String],
    dosageInstructions: String,
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
