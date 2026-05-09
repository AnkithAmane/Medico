const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentDate, timeSlot, appointmentType, symptoms } = req.body;

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      timeSlot,
      appointmentType,
      status: 'scheduled',
      consultationFee: doctor.consultationFee,
      symptoms,
    });

    // Add appointment to patient's list
    patient.appointments.push(appointment._id);
    await patient.save();

    // Add appointment to doctor's list
    doctor.appointments.push(appointment._id);
    await doctor.save();

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Patient Appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    let query = { patientId };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('doctorId')
      .populate('patientId')
      .sort({ appointmentDate: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Doctor Appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;

    let query = { doctorId };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patientId')
      .populate('doctorId')
      .sort({ appointmentDate: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Appointment Status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, consultationNotes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status,
        consultationNotes,
        completedAt: status === 'completed' ? new Date() : null,
      },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, message: 'Appointment updated', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Appointment Details
exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId')
      .populate('prescriptions');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { appointmentDate, timeSlot } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { appointmentDate, timeSlot },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, message: 'Appointment rescheduled', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId')
      .populate('doctorId')
      .exec();

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
