const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
    },
    specialization: {
      type: String,
      required: [true, 'Please provide specialization'],
    },
    qualification: String,
    licenseNumber: {
      type: String,
      sparse: true,
      default: null
    },
    experience: {
      type: Number,
      default: 0
    },
    department: String,
    hospital: String,
    fees: {
      type: Number,
      required: [true, 'Please provide consultation fee'],
    },
    location: {
      type: String,
      default: ''
    },
    branch: {
      type: String,
      default: 'Main Branch'
    },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
        slotDuration: Number,
      },
    ],
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
    bio: String,
    profilePic: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    appointments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);