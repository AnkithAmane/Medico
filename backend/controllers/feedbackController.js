const Feedback = require("../models/Feedback_Model");
const Appointment = require("../models/Appointment_Model"); // Required to update parent document flags

/**
 * SUBMIT APPOINTMENT FEEDBACK
 * POST /api/feedback/submit
 */
exports.createFeedback = async (req, res) => {
  try {
    const {
      appointmentId,
      rating,
      comments,
      comment,
      patientId,
      patientName,
      doctorName,
    } = req.body;

    // 1. Check data presence integrity
    if (!appointmentId || !rating || !patientId || !doctorName) {
      return res
        .status(400)
        .json({ message: "Missing required properties in request matrix." });
    }

    // 2. Locate target appointment document
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Target clinical appointment record not found." });
    }

    // 3. Confirm constraints (Must be completed and not yet reviewed)
    if (appointment.status !== "Completed") {
      return res.status(400).json({
        message:
          "Cannot submit evaluation logs for ongoing or cancelled slots.",
      });
    }
    if (appointment.hasFeedback) {
      return res.status(400).json({
        message:
          "Feedback track has already been initialized for this session.",
      });
    }

    // 4. Save distinct Feedback entry document
    const feedbackAsset = new Feedback({
      appointmentId,
      patientId,
      patientName: patientName || "Anonymous Patient", // Unified fallback metric
      doctorName,
      rating: Number(rating),
      comments: comments || comment || "", // Support both field style schemas
    });
    const savedFeedback = await feedbackAsset.save();

    // 5. Atomic Update: Set indicators inside parent Appointment document
    appointment.hasFeedback = true;
    appointment.feedbackRef = savedFeedback._id; // Relational join trace pointer
    await appointment.save();

    res.status(201).json({
      message:
        "Feedback processed and linked to appointment profile successfully.",
      data: savedFeedback,
    });
  } catch (err) {
    console.error("Feedback Controller Engine Crash:", err);
    res.status(500).json({
      message: "Internal transactional database server error.",
      error: err.message,
    });
  }
};

/**
 * GET FEEDBACK BY INDIVIDUAL DOCTOR NAME
 * GET /api/feedback/doctor
 */
exports.getFeedbackByDoctor = async (req, res) => {
  try {
    const { doctorName } = req.query;

    if (!doctorName) {
      return res
        .status(400)
        .json({ message: "doctorName parameter query is required." });
    }

    const reports = await Feedback.find({ doctorName: doctorName }).sort({
      createdAt: -1,
    });

    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({
      message: "Internal server error reading telemetry feedback layers",
      error: err.message,
    });
  }
};

/**
 * GET ALL GLOBAL REVIEWS (For the Analytics & Leaderboard Dashboard)
 * GET /api/feedback/all
 */
exports.getAllGlobalFeedback = async (req, res) => {
  try {
    // 🟢 FIXED: Swapped 'Review' out for 'Feedback' to eliminate the 500 error
    const data = await Feedback.find({}).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    console.error("Global Data Telemetry Failure:", err);
    res.status(500).json({
      message: "Failed to read sentiment telemetry layers.",
      error: err.message,
    });
  }
};

/**
 * ARCHIVE / DELETION PIPELINE
 * DELETE /api/feedback/delete/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    // 🟢 FIXED: Swapped 'Review' out for 'Feedback'
    const targetItem = await Feedback.findByIdAndDelete(req.params.id);
    if (!targetItem) {
      return res
        .status(404)
        .json({ message: "Feedback log record not found." });
    }
    res.status(200).json({ message: "Review archived successfully." });
  } catch (err) {
    res.status(500).json({
      message: "Operational feedback processing deletion failure.",
      error: err.message,
    });
  }
};
