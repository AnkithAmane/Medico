const mongoose = require('mongoose');

const diagnosticTestSchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      required: [true, 'Please provide test name'],
      unique: true,
    },
    category: {
      type: String,
      enum: ['blood', 'urine', 'imaging', 'cardiac', 'respiratory', 'other'],
      default: 'other',
    },
    price: {
      type: Number,
      required: true,
    },
    description: String,
    sampleType: String, // e.g., "Blood", "Urine"
    preparationInstructions: String,
    resultDeliveryTime: String, // e.g., "2-3 hours"
    normalRange: {
      min: Number,
      max: Number,
      unit: String,
    },
    laboratory: String,
    isAvailable: {
      type: Boolean,
      default: true,
    },
    homeCollectionAvailable: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiagnosticTest', diagnosticTestSchema);
