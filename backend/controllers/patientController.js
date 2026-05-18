const Patient = require("../models/Patient_Model");
const Appointment = require("../models/Appointment_Model");

/**
 * 1. READ: Fetch Live Appointments for Dashboard via Patient ID
 * RECTIFIED: Uses patientId instead of Name string parameter to prevent CastErrors
 */
exports.getDashboardData = async (req, res) => {
  try {
    const { patientId } = req.params;

    // SHORT-CIRCUIT GUARD: If the route is triggered by an unauthenticated guest
    if (!patientId || patientId === "Guest User") {
      return res.status(400).json({
        message:
          "Aborted lookup: Cannot fetch clinical dashboard matrix for an unauthenticated Guest Session framework.",
      });
    }

    // Query using the structural schema path index identifier field name
    const appointments = await Appointment.find({ patientId: patientId });
    res.status(200).json(appointments);
  } catch (err) {
    console.error("Dashboard controller crash trace:", err);
    res
      .status(500)
      .json({ message: "Error fetching dashboard data", error: err.message });
  }
};

/**
 * 2. READ: Get Specific Profile Details
 */
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "Guest User") {
      return res
        .status(400)
        .json({
          message: "Profile access restricted for anonymous system guests.",
        });
    }

    const patient = await Patient.findById(id);
    if (!patient) {
      return res
        .status(404)
        .json({ message: "Patient clinical record profile folder not found." });
    }

    res.status(200).json(patient);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Internal server error during profile registry access.",
      });
  }
};

/**
 * 3. UPDATE: Sync Profile Text Fields and Photos
 * NOTE: spread syntax dynamically includes 'emergencyContact' from req.body natively
 */
exports.updatePatientProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "Guest User") {
      return res
        .status(400)
        .json({ message: "Modifications restricted for anonymous profiles." });
    }

    let updateData = { ...req.body };

    // If your Multer middleware intercepted a file upload packet stream
    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }, // runValidators forces validation checks on update loops
    );

    if (!updatedPatient) {
      return res
        .status(404)
        .json({
          message: "Target document no longer tracks in registration database.",
        });
    }

    res.status(200).json({ user: updatedPatient });
  } catch (err) {
    console.error("Profile saving crash trace log:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

/**
 * 4. FETCH ALL: Administrative Patient Management Registry Table
 */
exports.getAllPatients = async (req, res) => {
  try {
    // Exclude password string vectors from traveling down open network channels
    const patients = await Patient.find({}).select("-password");
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching clinical registry" });
  }
};
