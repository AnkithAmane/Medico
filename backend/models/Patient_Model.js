const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const PatientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    /* Profile Details */
    photo: { type: String, default: "https://i.pravatar.cc/150?u=default" },
    contact: { type: String, required: false },
    age: { type: Number, required: false },
    gender: { type: String, required: false },
    bloodGroup: { type: String, required: false },
    height: { type: String, required: false },
    weight: { type: String, required: false },
    disease: { type: String, required: false },
    registrationDate: {
      type: String,
      default: () => new Date().toLocaleDateString(),
    },
    emergencyContact: { type: String, required: false, default: "" },
    dob: { type: String },

    // NOTE: Internal 'vault' array removed.
    // All clinical records are now handled by the standalone Vault_Model.
  },
  { timestamps: true },
);

/**
 * PASSWORD ENCRYPTION LOGIC
 * Automatically hashes passwords before saving to the database.
 */
PatientSchema.pre("save", async function () {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error("Password encryption failed: " + error.message);
  }
});

/**
 * HELPER: Compare entered password with hashed password
 */
PatientSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exported as 'Patients' to match Appointment_Model references
module.exports = mongoose.model("Patients", PatientSchema);
