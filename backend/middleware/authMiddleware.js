const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    console.log('Auth header:', req.headers.authorization)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    console.log('Token found, verifying...')
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded)
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = { id: user._id, role: user.role };
    next();
  } catch (err) {
    console.log('Auth error:', err.message)
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  try {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

