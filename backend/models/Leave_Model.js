const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["Full_Day", "Slot_Block"], // Full_Day handles single/group ranges; Slot_Block handles hours
    required: true,
    default: "Full_Day",
  },
  startDate: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  endDate: {
    type: String, // Format: YYYY-MM-DD (Identical to startDate for a single day leave)
    required: true,
  },
  blockedSlots: {
    type: [String], // Used if leaveType is 'Slot_Block' (e.g., ["10:00 AM", "11:00 AM"])
    default: [],
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);
