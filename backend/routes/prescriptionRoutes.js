const express = require('express');
const router = express.Router();
const { createPrescription, getPatientPrescriptions, getPrescriptionDetails, updatePrescription, deletePrescription } = require('../controllers/prescriptionCtrl');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('doctor', 'admin'), createPrescription);
router.get('/patient/:patientId', protect, getPatientPrescriptions);
router.put('/:prescriptionId', protect, authorize('doctor', 'admin'), updatePrescription);
router.delete('/:prescriptionId', protect, authorize('doctor', 'admin'), deletePrescription);
router.get('/:prescriptionId', protect, getPrescriptionDetails);

module.exports = router;
