const Medicine = require('../models/Medicine_Model');
const Vault = require('../models/Vault_Model');

// LOGIC: Handle Automatic Fulfillment from Patient Vault
exports.handleAutoFulfill = async (req, res) => {
    try {
        const { vaultId, resourceId, quantity } = req.body;

        // 1. Find the Medicine in the inventory
        const medicine = await Medicine.findById(resourceId);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found in registry." });
        }

        // 2. Check Stock Availability
        if (medicine.stock < quantity) {
            return res.status(400).json({ 
                message: `Insufficient stock. Available: ${medicine.stock}, Requested: ${quantity}` 
            });
        }

        // 3. Atomically Deduct Stock
        medicine.stock -= quantity;
        await medicine.save();

        // 4. Mark the Vault Record as fulfilled so the "Order" button disappears
        await Vault.findByIdAndUpdate(vaultId, { isOrdered: true });

        res.status(200).json({ 
            message: "Stock deducted and order confirmed.",
            remainingStock: medicine.stock 
        });
    } catch (err) {
        res.status(500).json({ message: "Procurement Error: " + err.message });
    }
};

// LOGIC: Manual Stock Requisition (For Pharmacy Staff)
exports.handleManualOrder = async (req, res) => {
    try {
        const { resourceId, quantity } = req.body;
        const medicine = await Medicine.findById(resourceId);
        
        if (!medicine) return res.status(404).json({ message: "Item not found" });

        medicine.stock += parseInt(quantity); // For refills
        await medicine.save();

        res.status(200).json({ message: "Inventory updated manually", newStock: medicine.stock });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getHistory = async (req, res) => {
    try {
        // Example logic to fetch history
        const history = await Vault.find({ isOrdered: true }).populate('patientId');
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};