const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason, type } = req.body;

    // Verify patient exists by userId
    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Generate record ID
    const recordId = `MS-PT${Date.now().toString().slice(-6)}`

    // Create appointment
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date,
      time,
      reason: reason || '',
      type: type || 'online',
      status: 'upcoming',
      fees: doctor.fees || 0,
      recordId,
      branch: doctor.branch || 'Main Branch'
    });

    // Add appointment to patient's list
    patient.appointments.push(appointment._id);
    await patient.save();

    // Add appointment to doctor's list
    doctor.appointments.push(appointment._id);
    await doctor.save();

    res.status(201).json({ 
      success: true, 
      message: 'Appointment booked successfully', 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Patient Appointments
exports.getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    const patient = await Patient.findOne({ userId: patientId });
    
    let query = { 
      patientId: patient ? patient._id : patientId 
    }
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          model: 'User'
        }
      })
      .populate('doctorId')
      .sort({ date: -1 });

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
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          model: 'User'
        }
      })
      .populate('doctorId')
      .sort({ date: 1 });

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

    res.status(200).json({ 
      success: true, 
      message: 'Appointment updated', 
      data: appointment 
    });
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

    res.status(200).json({ 
      success: true, 
      message: 'Appointment cancelled', 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Appointment Details
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'patientId',
        populate: { path: 'userId', model: 'User' }
      })
      .populate('doctorId')
      .sort({ date: -1 })

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, time } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { date, time },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Appointment rescheduled', 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', model: 'User' }
      })
      .populate('doctorId')

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};