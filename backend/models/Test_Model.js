const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g., "Full Body MRI"
    },
    category: {
      type: String,
      required: true,
      enum: ["Radiology", "Pathology", "Cardiology", "Neurology", "General"],
      default: "General",
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String, // e.g., "Requires 8 hours of fasting"
    },
    sampleRequired: {
      type: String,
      default: "None", // e.g., "Blood", "Urine", "N/A"
    },
    turnaroundTime: {
      type: String,
      default: "24 Hours", // Expected time for results
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Tests", TestSchema);
