const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide a rating'],
    },
    feedback: {
      type: String,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    professionalism: Number,
    communication: Number,
    cleanliness: Number,
    punctuality: Number,
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
