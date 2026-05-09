const express = require('express');
const router = express.Router();
const { bookAppointment, getPatientAppointments, getDoctorAppointments, updateAppointmentStatus, cancelAppointment, getAppointmentDetails, rescheduleAppointment, getAllAppointments } = require('../controllers/appointmentCtrl');
const { protect, authorize } = require('../middleware/authMiddleware');
const { appointmentValidation } = require('../middleware/validation');

router.get('/', protect, getAllAppointments);
router.post('/', protect, ...appointmentValidation.book, bookAppointment);
router.get('/patient/:patientId', protect, getPatientAppointments);
router.get('/doctor/:doctorId', protect, getDoctorAppointments);
router.put('/:appointmentId/reschedule', protect, rescheduleAppointment);
router.put('/:appointmentId', protect, authorize('doctor', 'admin'), updateAppointmentStatus);
router.delete('/:appointmentId', protect, cancelAppointment);
router.get('/:appointmentId', protect, getAppointmentDetails);

module.exports = router;
