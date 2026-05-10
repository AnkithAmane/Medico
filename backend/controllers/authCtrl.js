const User = require('../models/User');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, contact, role = 'patient', gender, dateOfBirth } = req.body;
  
  if (!firstName || !lastName || !email || !password || !contact) {
    return res.status(400).json({ success: false, message: 'All fields required', statusCode: 400 });
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered', statusCode: 400 });
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  const user = await User.create({ 
    firstName, lastName, email, 
    password: hashedPassword, 
    contact, role, gender, dateOfBirth 
  });

  // Auto create patient profile on register
  if (role === 'patient') {
    await Patient.create({ userId: user._id })
  }

  const token = generateToken(user._id);
  const userData = user.toObject();
  delete userData.password;

  res.status(201).json({ success: true, token, user: userData });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required', statusCode: 400 });
  }
  
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials', statusCode: 401 });
  }

  const isPasswordCorrect = await bcryptjs.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ success: false, message: 'Invalid credentials', statusCode: 401 });
  }

  const token = generateToken(user._id);
  const userData = user.toObject();
  delete userData.password;

  res.status(200).json({ success: true, token, user: userData });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
};

exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await User.findById(req.user.id).select('+password')
  const isMatch = await bcryptjs.compare(currentPassword, user.password)
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' })
  user.password = await bcryptjs.hash(newPassword, 10)
  await user.save()
  res.status(200).json({ success: true, message: 'Password updated successfully' })
})

exports.updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body
  const existing = await User.findOne({ email })
  if (existing) return res.status(400).json({ success: false, message: 'Email already in use' })
  await User.findByIdAndUpdate(req.user.id, { email })
  res.status(200).json({ success: true, message: 'Email updated successfully' })
})