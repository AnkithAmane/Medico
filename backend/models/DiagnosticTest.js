const mongoose = require('mongoose');

const diagnosticTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide test name'],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: true
      // Pathology, Diabetic, Cardiology, Endocrinology, etc.
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: ''
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
    fastingNote: {
      type: String,
      default: ''
      // e.g. "No fasting required" or "10-12 hours fasting required"
    },
    sampleType: {
      type: String,
      default: ''
    },
    preparationInstructions: {
      type: String,
      default: ''
    },
    resultDeliveryTime: {
      type: String,
      default: ''
    },
    normalRange: {
      min: Number,
      max: Number,
      unit: String,
    },
    laboratory: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    homeCollectionAvailable: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiagnosticTest', diagnosticTestSchema);