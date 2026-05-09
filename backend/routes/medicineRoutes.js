const express = require('express');
const router = express.Router();
const { getAllMedicines, getMedicineDetails, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineCtrl');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllMedicines);
router.get('/:medicineId', getMedicineDetails);
router.post('/', protect, authorize('admin'), createMedicine);
router.put('/:medicineId', protect, authorize('admin'), updateMedicine);
router.delete('/:medicineId', protect, authorize('admin'), deleteMedicine);

module.exports = router;
