const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    /* Custom ID: e.g., DOC-010 */
    doctorId: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    degrees: { type: String, required: true },
    department: { type: String, required: true },
    age: { type: Number },
    experience: { type: String },
    branch: { type: String },
    fee: { type: Number },

    /* --- NEW SCHEDULING FIELDS --- */
    availability: {
      type: String,
      enum: ["Available", "On Leave", "Busy"],
      default: "Available",
    },
    shiftStart: {
      type: String,
      default: "09:00", // Format: HH:mm (24h)
    },
    shiftEnd: {
      type: String,
      default: "17:00", // Format: HH:mm (24h)
    },
    blockedSlotsByDate: {
      type: Map,
      of: [String], // Array of blocked slot strings
      default: new Map(), // Initializes as an empty map structure natively
    },
    /* --- PROFESSIONAL BIO --- */
    bio: {
      type: String,
      default:
        "Dedicated medical professional committed to patient-centered care.",
    },
    phone: { type: String },
    photo: { type: String }, // Filename for profile image
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
