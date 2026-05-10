const mongoose = require('mongoose');

const medicalVaultSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    // What UI shows
    fileName: {
      type: String,
      required: [true, 'Please provide file name'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Please provide file URL'],
    },
    fileSize: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['Prescriptions', 'Lab Reports', 'Radiology', 'Invoices'],
      required: true,
    },

    // Extra info
    description: {
      type: String,
      default: ''
    },
    uploadedBy: {
      type: String,
      default: 'patient'
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      default: null,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },

    // Sharing
    sharingStatus: [
      {
        doctorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        sharedOn: Date,
        accessLevel: {
          type: String,
          enum: ['view', 'download'],
          default: 'view',
        },
      },
    ],

    // Access history
    accessHistory: [
      {
        accessedBy: { type: String },
        action: { type: String },
        accessedAt: { type: Date, default: Date.now }
      }
    ],

    lastAccessedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalVault', medicalVaultSchema);