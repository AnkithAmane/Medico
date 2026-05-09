const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');

// Create Patient Profile
exports.createPatientProfile = async (req, res) => {
  try {
    const { userId, age, bloodGroup, height, weight, medicalHistory } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingPatient = await Patient.findOne({ userId });
    if (existingPatient) {
      return res.status(400).json({ success: false, message: 'Patient profile already exists' });
    }

    const patient = await Patient.create({
      userId,
      age,
      bloodGroup,
      height,
      weight,
      medicalHistory: medicalHistory || [],
    });

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register Patient
exports.registerPatient = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contact, gender, dateOfBirth } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      contact,
      role: 'patient',
      gender,
      dateOfBirth,
    });

    const patient = await Patient.create({
      userId: user._id,
      age: calculateAge(new Date(dateOfBirth)),
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      user,
      patient,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Patient Profile
exports.getPatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('Looking for patient with userId:', patientId)
    
    let patient = await Patient.findOne({ userId: patientId })
    
    console.log('Found patient:', patient)
    

    // Auto create patient profile if not exists
    if (!patient) {
      const user = await User.findById(patientId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      patient = await Patient.create({ userId: patientId });
      patient = await Patient.findOne({ userId: patientId }).populate('userId');
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Patient Profile
exports.updatePatientProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { age, height, weight, bloodGroup, primaryDisease, allergies } = req.body;

    // Update by userId
    const patient = await Patient.findOneAndUpdate(
      { userId: patientId },
      {
        age,
        height,
        weight,
        bloodGroup,
        primaryDisease,
        allergies,
        lastUpdatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Medical History
exports.addMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { condition, date, description } = req.body;

    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.medicalHistory.push({ condition, date, description });
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Medical history added',
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Current Medication
exports.addCurrentMedication = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { medicationName, dosage, frequency, startDate, endDate } = req.body;

    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.currentMedications.push({
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
    });
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Medication added',
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Patients (Admin)
exports.getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const patients = await Patient.find()
      .populate('userId')
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await Patient.countDocuments();

    res.status(200).json({
      success: true,
      data: patients,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Patient
exports.deletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findOneAndDelete({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await User.findByIdAndDelete(patientId);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function
function calculateAge(dateOfBirth) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}