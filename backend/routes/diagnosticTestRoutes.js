const express = require('express');
const router = express.Router();
const { getAllDiagnosticTests, getTestDetails, createDiagnosticTest, updateDiagnosticTest, deleteDiagnosticTest } = require('../controllers/diagnosticTestCtrl');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAllDiagnosticTests);
router.get('/:testId', getTestDetails);
router.post('/', protect, authorize('admin'), createDiagnosticTest);
router.put('/:testId', protect, authorize('admin'), updateDiagnosticTest);
router.delete('/:testId', protect, authorize('admin'), deleteDiagnosticTest);

module.exports = router;
