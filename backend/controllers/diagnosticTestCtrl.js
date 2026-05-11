const DiagnosticTest = require('../models/DiagnosticTest');

// Get All Diagnostic Tests
exports.getAllDiagnosticTests = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;

    let query = { isAvailable: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const tests = await DiagnosticTest.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await DiagnosticTest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Test Details
exports.getTestDetails = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await DiagnosticTest.findById(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Diagnostic test not found' });
    }

    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Diagnostic Test (Admin)
exports.createDiagnosticTest = async (req, res) => {
  try {
    const { 
      name, category, price, description,
      fastingRequired, fastingNote,
      sampleType, preparationInstructions,
      resultDeliveryTime, normalRange,
      laboratory, homeCollectionAvailable
    } = req.body;

    const test = await DiagnosticTest.create({
      name,
      category,
      price,
      description,
      fastingRequired: fastingRequired || false,
      fastingNote: fastingNote || '',
      sampleType,
      preparationInstructions,
      resultDeliveryTime,
      normalRange,
      laboratory,
      homeCollectionAvailable: homeCollectionAvailable || false,
    });

    res.status(201).json({ 
      success: true, 
      message: 'Diagnostic test created', 
      data: test 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Diagnostic Test (Admin)
exports.updateDiagnosticTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const updateData = req.body;

    const test = await DiagnosticTest.findByIdAndUpdate(
      testId, 
      updateData, 
      { new: true, runValidators: true }
    );
    if (!test) {
      return res.status(404).json({ success: false, message: 'Diagnostic test not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Test updated', 
      data: test 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Diagnostic Test (Admin)
exports.deleteDiagnosticTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await DiagnosticTest.findByIdAndDelete(testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Diagnostic test not found' });
    }

    res.status(200).json({ success: true, message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};