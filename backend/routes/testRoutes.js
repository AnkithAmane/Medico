const express = require("express");
const router = express.Router();
const Test = require("../models/Test_Model");

// Handle GET http://localhost:5000/api/tests/all
router.get("/all", async (req, res) => {
  try {
    const tests = await Test.find();
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tests" });
  }
});

module.exports = router;
