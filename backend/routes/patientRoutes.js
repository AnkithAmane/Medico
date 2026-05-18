const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const upload = require("../middleware/upload"); // For Multer

/* All these routes are now independent of /api/auth */
router.get("/dashboard/:name", patientController.getDashboardData);
router.get("/profile/:id", patientController.getProfile);
router.put(
  "/update/:id",
  upload.single("photo"),
  patientController.updatePatientProfile,
);
router.get("/all", patientController.getAllPatients); // ADD THIS LINE
module.exports = router;
