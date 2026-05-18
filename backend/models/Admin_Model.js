const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "SuperAdmin" },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);
const bcrypt = require("bcryptjs");

// Add this before module.exports in Admin_Model.js
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
module.exports = mongoose.model("Admins", AdminSchema);
