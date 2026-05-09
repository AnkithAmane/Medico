const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Create Doctor Profile
exports.createDoctorProfile = async (req, res) => {
  try {
    const { userId, specialization, qualification, licenseNumber, yearsOfExperience, department, hospital, consultationFee, bio, availableSlots } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: 'Doctor profile already exists for this user' });
    }

    // Create doctor profile
    const doctor = await Doctor.create({
      userId,
      specialization,
      qualification,
      licenseNumber,
      yearsOfExperience,
      department,
      hospital,
      consultationFee,
      bio,
      availableSlots: availableSlots || [],
    });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Doctor Profile by ID
exports.getDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
      .populate('userId')
      .populate('appointments')
      .populate('reviews');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
      .populate('userId')
      .populate('appointments')
      .populate('reviews');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Doctor Profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { specialization, qualification, yearsOfExperience, department, hospital, consultationFee, bio, availableSlots } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        specialization,
        qualification,
        yearsOfExperience,
        department,
        hospital,
        consultationFee,
        bio,
        availableSlots,
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const doctors = await Doctor.find()
      .populate('userId')
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await Doctor.countDocuments();

    res.status(200).json({
      success: true,
      data: doctors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await User.findByIdAndDelete(doctor.userId);

    res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
