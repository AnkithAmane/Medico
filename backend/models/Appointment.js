const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: String,
      required: [true, 'Please provide appointment date'],
    },
    time: {
      type: String,
      required: [true, 'Please provide time slot'],
    },
    type: {
      type: String,
      enum: ['online', 'routine', 'emergency'],
      default: 'online',
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled', 'pending'],
      default: 'upcoming',
    },
    reason: {
      type: String,
      default: ''
    },
    fees: {
      type: Number,
      default: 0
    },
    recordId: {
      type: String,
      default: ''
    },
    branch: {
      type: String,
      default: 'Main Branch'
    },
    notes: String,
    prescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
      },
    ],
    diagnosticTests: [
      {
        testName: String,
        date: Date,
        result: String,
      },
    ],
    consultationNotes: String,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);