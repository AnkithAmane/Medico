const express = require('express');
const router = express.Router();
const { 
  createDoctorProfile, 
  getDoctorProfile, 
  updateDoctorProfile, 
  getAllDoctors, 
  getDoctorById, 
  deleteDoctor,
  getDoctorByUserId
} = require('../controllers/docCtrl');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllDoctors);
router.post('/', protect, createDoctorProfile);
router.get('/user/:userId', protect, getDoctorByUserId);
router.get('/:doctorId', getDoctorById);
router.put('/:doctorId', protect, authorize('doctor', 'admin'), updateDoctorProfile);
router.delete('/:doctorId', protect, authorize('admin'), deleteDoctor);

module.exports = router;