const Patient = require("../models/Patient_Model");
const Doctor = require("../models/Doctor_Model"); // Ensure this file exists
const Admin = require("../models/Admin_Model");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bcrypt = require("bcryptjs");
require("dotenv").config();

/* --- Utility: Token Generation --- */
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

/**
 * @section Standard Registration (Email/Password)
 */
exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newPatient = new Patient({
      name,
      email,
      password, // Will be hashed by pre-save hook in Model
    });

    await newPatient.save();

    const token = createToken(newPatient._id, "Patient");
    res.status(201).json({ token, user: newPatient, role: "Patient" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @section Standard Sign In
 */
exports.signIn = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let Model;
    if (role === "Patient") Model = Patient;
    else if (role === "Doctor") Model = Doctor;
    else if (role === "Admin") Model = Admin;
    else return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    // --- TEMPORARY: PLAIN TEXT CHECK ---
    // Change: const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password;

    if (!isMatch) return res.status(401).json({ message: "Invalid Password" });

    const token = createToken(user._id, role);
    const userData = user.toObject();
    delete userData.password;

    return res.json({ token, user: userData, role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @section Google Authentication (Unified Sign-In/Sign-Up)
 */
exports.googleAuth = async (req, res) => {
  const { token, role } = req.body;

  try {
    // 1. Verify token with Google API
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
    );
    const { email, name, picture } = googleRes.data;

    // 2. Identify correct Model
    const Model = role === "Doctor" ? Doctor : Patient;

    // 3. Find or Create User (Upsert logic)
    let user = await Model.findOne({ email });

    if (!user) {
      user = new Model({
        name,
        email,
        photo: picture,
        password: `google_auth_${Date.now()}`, // Placeholder password
      });
      await user.save();
    }

    const appToken = createToken(user._id, role);

    res.status(200).json({
      token: appToken,
      user,
      role,
    });
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};

/**
 * @section Password Management
 */
exports.updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const patient = await Patient.findOne({ email });

    if (!patient) return res.status(404).json({ message: "User not found" });

    patient.password = newPassword;
    await patient.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * @section Profile Management
 */
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedPatient,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @section Email Management
 */
exports.updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const user = await Patient.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const emailExists = await Patient.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use." });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: "Email updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
