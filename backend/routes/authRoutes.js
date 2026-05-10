const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  logout,
  updatePassword,
  updateEmail
} = require('../controllers/authCtrl');
const { protect } = require('../middleware/authMiddleware');
const { authValidation } = require('../middleware/validation');

router.post('/register', ...authValidation.register, register);
router.post('/login', ...authValidation.login, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-password', protect, updatePassword);
router.put('/update-email', protect, updateEmail);



module.exports = router;