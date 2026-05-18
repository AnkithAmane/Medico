const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { protect } = require("../middleware/authMiddleware");

router.post("/submit", feedbackController.createFeedback);
router.get("/doctor", protect, feedbackController.getFeedbackByDoctor);

// These map perfectly to what your dashboard frontend requests!
router.get("/all", protect, feedbackController.getAllGlobalFeedback);
router.delete("/delete/:id", protect, feedbackController.deleteReview);

module.exports = router;
