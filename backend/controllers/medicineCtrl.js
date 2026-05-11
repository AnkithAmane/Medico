const Medicine = require('../models/Medicine');

// Get All Medicines
exports.getAllMedicines = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;

    let query = { inStock: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const medicines = await Medicine.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Medicine.countDocuments(query);

    res.status(200).json({
      success: true,
      data: medicines,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Medicine Details
exports.getMedicineDetails = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Medicine (Admin)
exports.createMedicine = async (req, res) => {
  try {
    const { 
      name, genericName, manufacturer, category, 
      strength, form, price, description, dosage,
      sideEffects, contraindications, requiresPrescription,
      inStock, isVerified, stockQuantity
    } = req.body;

    const medicine = await Medicine.create({
      name,
      genericName,
      manufacturer,
      category,
      strength,
      form,
      price,
      description,
      dosage,
      sideEffects,
      contraindications,
      requiresPrescription,
      inStock: inStock !== undefined ? inStock : true,
      isVerified: isVerified !== undefined ? isVerified : true,
      stockQuantity: stockQuantity || 100
    });

    res.status(201).json({ 
      success: true, 
      message: 'Medicine created', 
      data: medicine 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Medicine (Admin)
exports.updateMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const updateData = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      medicineId, 
      updateData, 
      { new: true, runValidators: true }
    );
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Medicine updated', 
      data: medicine 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Medicine (Admin)
exports.deleteMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;

    const medicine = await Medicine.findByIdAndDelete(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.status(200).json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};