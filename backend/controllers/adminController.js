const Admin = require("../models/Admin_Model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/* Utility: Generate JWT */
const createToken = (id) => {
  return jwt.sign({ id, role: "Admin" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

/**
 * @section Admin Registration
 */
exports.adminSignUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if Admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin email already registered." });
    }

    // 2. Create new Admin record
    // Note: Ensure your Admin_Model has a .pre('save') hook to hash this password!
    const newAdmin = new Admin({
      name,
      email,
      password,
      role: role || "SuperAdmin",
    });

    await newAdmin.save();

    const token = createToken(newAdmin._id);
    res.status(201).json({
      message: "Admin created successfully",
      token,
      user: { name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @section Admin Login
 */
exports.adminSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find Admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid Admin Credentials" });
    }

    // 2. Verify Password
    // Assuming you have a comparePassword method in your Admin_Model
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Admin Credentials" });
    }

    // 3. Update lastLogin date
    admin.lastLogin = new Date();
    await admin.save();

    const token = createToken(admin._id);

    res.status(200).json({
      token,
      role: "Admin",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error during Admin Login" });
  }
};
