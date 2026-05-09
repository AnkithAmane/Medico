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
    appointmentDate: {
      type: Date,
      required: [true, 'Please provide appointment date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please provide time slot'],
    },
    appointmentType: {
      type: String,
      enum: ['consultation', 'follow-up', 'check-up', 'emergency'],
      default: 'consultation',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    consultationFee: Number,
    symptoms: String,
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
