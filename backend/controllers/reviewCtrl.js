const Review = require('../models/Review');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Create Review
exports.createReview = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, rating, feedback, professionalism, communication, cleanliness, punctuality } = req.body;

    // Verify patient and doctor exist
    const patient = await Patient.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ success: false, message: 'Patient or Doctor not found' });
    }

    // Create review
    const review = await Review.create({
      patientId,
      doctorId,
      appointmentId,
      rating,
      feedback,
      professionalism,
      communication,
      cleanliness,
      punctuality,
    });

    // Add review to patient's list
    patient.reviews.push(review._id);
    await patient.save();

    // Add review to doctor's list
    doctor.reviews.push(review._id);

    // Update doctor's rating
    const allReviews = await Review.find({ doctorId });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    doctor.rating = averageRating;
    doctor.totalReviews = allReviews.length;
    await doctor.save();

    res.status(201).json({ success: true, message: 'Review created successfully', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Doctor Reviews
exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ doctorId, isVerified: true })
      .populate('patientId', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Review.countDocuments({ doctorId, isVerified: true });

    res.status(200).json({
      success: true,
      data: reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Patient Reviews
exports.getPatientReviews = async (req, res) => {
  try {
    const { patientId } = req.params;

    const reviews = await Review.find({ patientId })
      .populate('doctorId', 'specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Review Details
exports.getReviewDetails = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate('patientId')
      .populate('doctorId');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, feedback, professionalism, communication, cleanliness, punctuality } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        rating,
        feedback,
        professionalism,
        communication,
        cleanliness,
        punctuality,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Update doctor's rating
    const doctor = await Doctor.findById(review.doctorId);
    const allReviews = await Review.find({ doctorId: review.doctorId });
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    doctor.rating = averageRating;
    await doctor.save();

    res.status(200).json({ success: true, message: 'Review updated', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Remove from patient
    await Patient.updateOne({ _id: review.patientId }, { $pull: { reviews: reviewId } });

    // Remove from doctor and update rating
    const doctor = await Doctor.findById(review.doctorId);
    doctor.reviews = doctor.reviews.filter(r => r.toString() !== reviewId);
    const allReviews = await Review.find({ doctorId: review.doctorId });
    doctor.rating = allReviews.length > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
    doctor.totalReviews = allReviews.length;
    await doctor.save();

    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
