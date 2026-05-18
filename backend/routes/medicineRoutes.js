const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine_Model');

// 1. GET ALL: Fetches live inventory for Doctors & Pharmacy
router.get('/all', async (req, res) => {
  try {
    const meds = await Medicine.find().sort({ name: 1 });
    res.status(200).json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. ADD MEDICINE: For Admin/Pharmacy to stock up
router.post('/add', async (req, res) => {
  try {
    const newMed = new Medicine(req.body);
    await newMed.save();
    res.status(201).json({ message: "Medicine added to inventory", data: newMed });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. DELETE: Remove obsolete stock
router.delete('/delete/:id', async (req, res) => {
    try {
        await Medicine.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Medicine removed from registry" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;