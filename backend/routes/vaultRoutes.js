const express = require("express");
const router = express.Router();
const vaultController = require("../controllers/vaultController");
const multer = require("multer");
const path = require("path");

// Multer Config for file storage
const storage = multer.diskStorage({
  destination: "./uploads/vault/",
  filename: (req, file, cb) => {
    cb(null, `VAULT_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// THE MISSING ROUTE: GET /api/patient/vault/:patientId
router.get("/:patientId", vaultController.getPatientVault);

// UPLOAD ROUTE
router.post("/upload", upload.single("document"), vaultController.uploadRecord);

module.exports = router;
