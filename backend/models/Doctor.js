const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please provide specialization'],
    },
    qualification: String,
    licenseNumber: {
      type: String,
      unique: true,
      required: true,
    },
    yearsOfExperience: Number,
    department: String,
    hospital: String,
    consultationFee: {
      type: Number,
      required: true,
    },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
        slotDuration: Number, // in minutes
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
    photo: String,
    isApproved: {
      type: Boolean,
      default: false,
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
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
