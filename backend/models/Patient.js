const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    height: {
      type: String, // e.g., "178 cm"
      default: null,
    },
    weight: {
      type: String, // e.g., "85 kg"
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      default: null,
    },
    primaryDisease: {
      type: String,
      default: null,
    },
    allergies: [String],
    medicalHistory: [String],
    currentMedications: [
      {
        medicationName: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      validUntil: Date,
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    medicalRecords: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalVault',
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    accountCreatedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
