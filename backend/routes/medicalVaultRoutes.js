const express = require('express');
const router = express.Router();
const { uploadMedicalRecord, getPatientMedicalRecords, getRecordDetails, shareRecordWithDoctor, revokeRecordAccess, updateRecord, deleteRecord, getSharedRecords } = require('../controllers/medicalVaultCtrl');
const { protect } = require('../middleware/authMiddleware');

router.post('/:patientId/upload', protect, uploadMedicalRecord);
router.get('/:patientId', protect, getPatientMedicalRecords);
router.post('/record/:recordId/share', protect, shareRecordWithDoctor);
router.delete('/record/:recordId/revoke/:doctorId', protect, revokeRecordAccess);
router.put('/record/:recordId', protect, updateRecord);
router.delete('/record/:recordId', protect, deleteRecord);
router.get('/doctor/:doctorId/shared', protect, getSharedRecords);
router.get('/record/:recordId', protect, getRecordDetails);

module.exports = router;
