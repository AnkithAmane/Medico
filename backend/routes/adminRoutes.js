const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Path: /api/admin/signup
router.post("/signup", adminController.adminSignUp);

// Path: /api/admin/signin
router.post("/signin", adminController.adminSignIn);

module.exports = router;
