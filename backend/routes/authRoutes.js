const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../middleware/upload");

router.post("/signup", authController.signUp);
router.post("/signin", authController.signIn);
router.post("/google", authController.googleAuth);
router.put("/update-password", authController.updatePassword);
router.put("/update-profile/:id", upload.single("photo"), authController.updateProfile);

module.exports = router;