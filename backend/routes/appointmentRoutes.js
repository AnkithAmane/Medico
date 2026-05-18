const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// --- Patient Side ---
router.post("/book", appointmentController.bookAppointment);
router.get("/list/:patientId", appointmentController.getPatientAppointments);
router.get("/check", appointmentController.checkAvailability);

// --- Doctor Side ---
router.get("/doctor/:name", appointmentController.getAppointmentsByDoctor);
router.put("/complete/:id", appointmentController.completeAppointment);
router.get("/replacements", appointmentController.getReplacementSpecialists);
router.put("/admin-request/:id", appointmentController.createAdminRequest);

// --- Admin Side ---
router.get("/all", appointmentController.getAllAppointments);
router.put("/cancel/:id", appointmentController.cancelAppointment);
router.put("/reschedule/:id", appointmentController.rescheduleAppointment);
router.get(
  "/admin/pending-requests",
  appointmentController.getPendingAdminRequests,
);
router.put(
  "/admin/resolve-request/:id",
  appointmentController.resolveAdminRequest,
);

module.exports = router; // Must be at the very bottom
