const mongoose = require("mongoose");

const VaultSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  name: { type: String, required: true },
  filename: { type: String, required: true }, // The name of the file in the /uploads folder
  type: {
    type: String,
    // CRITICAL FIX: Add 'Others' to the enum array list
    // Keep your legacy values here so older database rows don't break on load queries
    enum: ["Prescriptions", "Invoices", "Others", "Lab Reports", "Radiology"],
    default: "Others",
  },
  size: { type: Number },
  resourceId: { type: String, default: null }, // For automated pharmacy ordering
  isOrdered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vault", VaultSchema);
