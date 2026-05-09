const mongoose = require('mongoose');

const medicalVaultSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    documentType: {
      type: String,
      enum: ['prescription', 'lab_report', 'x_ray', 'ct_scan', 'ultrasound', 'pathology', 'medical_history', 'vaccination', 'insurance', 'other'],
      required: true,
    },
    documentTitle: {
      type: String,
      required: [true, 'Please provide document title'],
    },
    documentFile: {
      type: String,
      required: [true, 'Please provide document file URL'],
    },
    fileSize: Number, // in bytes
    fileFormat: String, // e.g., "pdf", "jpg", "png"
    uploadedBy: {
      type: String,
      enum: ['patient', 'doctor', 'hospital'],
      default: 'patient',
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
    description: String,
    issueDate: Date,
    expiryDate: Date,
    isPublic: {
      type: Boolean,
      default: false,
    },
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
    tags: [String],
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    lastAccessedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalVault', medicalVaultSchema);
