const MedicalVault = require('../models/MedicalVault');
const Patient = require('../models/Patient');

// Upload Medical Record
exports.uploadMedicalRecord = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { fileName, fileUrl, fileSize, category } = req.body;

    // Find patient by userId
    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Create medical record
    const record = await MedicalVault.create({
      patientId: patient._id,
      fileName,
      fileUrl,
      fileSize,
      category: category || 'Lab Reports',
    });

    // Add to patient's medical records
    patient.medicalRecords.push(record._id);
    await patient.save();

    res.status(201).json({ 
      success: true, 
      message: 'Record uploaded successfully', 
      data: record 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Patient Medical Records
exports.getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { category } = req.query;

    // Find patient by userId first
    const patient = await Patient.findOne({ userId: patientId });
    
    let query = { 
      patientId: patient ? patient._id : patientId,
      isDeleted: false 
    };
    if (category) query.category = category;

    const records = await MedicalVault.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Record Details
exports.getRecordDetails = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await MedicalVault.findByIdAndUpdate(
      recordId,
      { lastAccessedAt: new Date() },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Share Record with Doctor
exports.shareRecordWithDoctor = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { doctorId, accessLevel = 'view' } = req.body;

    const record = await MedicalVault.findById(recordId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const existingShare = record.sharingStatus.find(
      s => s.doctorId.toString() === doctorId
    );
    if (!existingShare) {
      record.sharingStatus.push({
        doctorId,
        sharedOn: new Date(),
        accessLevel,
      });
    }

    await record.save();

    res.status(200).json({ 
      success: true, 
      message: 'Record shared successfully', 
      data: record 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Revoke Record Access
exports.revokeRecordAccess = async (req, res) => {
  try {
    const { recordId, doctorId } = req.params;

    const record = await MedicalVault.findByIdAndUpdate(
      recordId,
      { $pull: { sharingStatus: { doctorId } } },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, message: 'Access revoked', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Record
exports.updateRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { fileName, category, description } = req.body;

    const record = await MedicalVault.findByIdAndUpdate(
      recordId,
      { fileName, category, description },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Record updated', 
      data: record 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Record
exports.deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;

    const record = await MedicalVault.findByIdAndUpdate(
      recordId,
      { isDeleted: true },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await Patient.updateOne(
      { _id: record.patientId }, 
      { $pull: { medicalRecords: recordId } }
    );

    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Shared Records (Doctor View)
exports.getSharedRecords = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const records = await MedicalVault.find({
      'sharingStatus.doctorId': doctorId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};