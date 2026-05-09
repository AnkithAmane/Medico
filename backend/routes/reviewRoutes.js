const express = require('express');
const router = express.Router();
const { createReview, getDoctorReviews, getPatientReviews, getReviewDetails, updateReview, deleteReview } = require('../controllers/reviewCtrl');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/doctor/:doctorId', getDoctorReviews);
router.get('/patient/:patientId', protect, getPatientReviews);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.get('/:reviewId', protect, getReviewDetails);

module.exports = router;
