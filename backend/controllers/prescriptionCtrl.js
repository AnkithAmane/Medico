const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

// Create Prescription
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, medicines, notes } = req.body;

    // Verify appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Create prescription
    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId,
      medicines,
      notes,
      issueDate: new Date(),
    });

    // Add prescription to appointment
    appointment.prescriptions.push(prescription._id);
    await appointment.save();

    res.status(201).json({ success: true, message: 'Prescription created', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Patient Prescriptions
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId')
      .populate('appointmentId')
      .sort({ issueDate: -1 });

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Prescription Details
exports.getPrescriptionDetails = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(prescriptionId)
      .populate('doctorId')
      .populate('patientId')
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { medicines, notes } = req.body;

    const prescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      { medicines, notes },
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.status(200).json({ success: true, message: 'Prescription updated', data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Prescription
exports.deletePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findByIdAndDelete(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Remove from appointment
    await Appointment.updateOne({ _id: prescription.appointmentId }, { $pull: { prescriptions: prescriptionId } });

    res.status(200).json({ success: true, message: 'Prescription deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
