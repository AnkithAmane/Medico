const express = require('express');
const router = express.Router();
const { 
  createPatientProfile, 
  getPatientProfile, 
  updatePatientProfile, 
  addMedicalHistory, 
  addCurrentMedication, 
  getAllPatients, 
  deletePatient 
} = require('../controllers/patientCtrl');
const { protect, authorize } = require('../middleware/authMiddleware');

// Specific routes first
router.post('/:patientId/medical-history', protect, addMedicalHistory);
router.post('/:patientId/medication', protect, addCurrentMedication);

// CRUD routes
router.get('/:patientId', protect, getPatientProfile);
router.put('/:patientId', protect, updatePatientProfile);
router.delete('/:patientId', protect, authorize('admin'), deletePatient);

// General routes last
router.get('/', protect, getAllPatients);
router.post('/', protect, createPatientProfile);

module.exports = router;