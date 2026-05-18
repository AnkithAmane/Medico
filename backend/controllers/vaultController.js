const Vault = require("../models/Vault_Model");

// FETCH ALL RECORDS FOR A PATIENT
exports.getPatientVault = async (req, res) => {
  try {
    const { patientId } = req.params;
    const records = await Vault.find({ patientId }).sort({ createdAt: -1 });

    // Even if no records found, return an empty array [] not a 404
    res.status(200).json(records);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error accessing vault", error: err.message });
  }
};

exports.uploadRecord = async (req, res) => {
  try {
    const { patientId, type } = req.body;

    // 1. Structural file upload parameter confirmation check
    if (!req.file) {
      return res
        .status(400)
        .json({
          message:
            "File data element not intercepted by Multer middleware wrapper.",
        });
    }

    // 2. Map file properties into database schema instantiation mapping
    const newRecord = new Vault({
      patientId,
      name: req.file.originalname,
      filename: req.file.filename,
      // Normalize values if they fall out of core structural configurations bounds
      type: type || "Others",
      size: req.file.size,
    });

    await newRecord.save();
    res
      .status(201)
      .json({
        message: "Clinical asset archived successfully",
        data: newRecord,
      });
  } catch (err) {
    console.error("CRITICAL VAULT UPLOAD CRASH LOG STATEMENT:", err);
    res
      .status(500)
      .json({
        message: "Internal system transaction failure.",
        error: err.message,
      });
  }
};
