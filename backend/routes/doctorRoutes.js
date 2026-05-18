const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

router.get("/list", doctorController.getAllDoctors);
router.get("/replacements", protect, doctorController.getAvailableReplacements); // Line 12

router.get("/profile/:id", doctorController.getDoctorById);
router.get("/analytics/:id", doctorController.getPerformanceStats);

router.post(
  "/register",
  protect,
  upload.single("photo"),
  doctorController.registerDoctor,
);
router.put(
  "/update/:id",
  protect,
  upload.single("photo"),
  doctorController.updateDoctorProfile,
);
router.put("/status/:id", protect, doctorController.updateAvailabilityStatus);
router.put("/review/reply/:id", protect, doctorController.addReviewReply);

router.get(
  "/availability/:doctorId/:date",
  protect,
  doctorController.getDoctorAvailabilityByDate,
);
router.put(
  "/availability/update",
  protect,
  doctorController.updateSlotAvailability,
);
module.exports = router;
