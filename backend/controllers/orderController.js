const Order = require("../models/Order_Model");
const Medicine = require("../models/Medicine_Model");
const Test = require("../models/Test_Model");

// 🟢 PLUG-IN DETECTOR: Handle Safe Checkout with Server-side Valuation Verification
exports.createOrder = async (req, res) => {
  try {
    const { items, patientId, patientName, paymentStatus, status } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cannot process an empty checkout matrix." });
    }

    let calculatedTotal = 0;
    const medicinesToUpdate = [];

    // 1. FIRST PASS: Stage and verify ALL items before modifying database balances
    for (const item of items) {
      if (item.type === "Medicine") {
        const med = await Medicine.findById(item.itemId);

        if (!med) {
          return res
            .status(404)
            .json({
              message: `Medicine item [${item.name}] not found in clinical database.`,
            });
        }

        if (med.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${item.name}. Available: ${med.stock}, Requested: ${item.quantity}`,
          });
        }

        // Stash the Mongoose document and intended deduction for a single runtime save execution
        medicinesToUpdate.push({ doc: med, quantity: item.quantity });
        calculatedTotal += med.price * item.quantity;
      } else if (item.type === "Test") {
        const labTest = await Test.findById(item.itemId);
        if (!labTest) {
          return res
            .status(404)
            .json({
              message: `Diagnostic procedure [${item.name}] not found.`,
            });
        }
        calculatedTotal += labTest.price * item.quantity;
      }
    }

    // 2. ATOMIC COMMIT: Safely execute stock reductions since all checks passed successfully
    for (const record of medicinesToUpdate) {
      record.doc.stock -= record.quantity;
      await record.doc.save();
    }

    // 3. SECURE BUILD: Construct document using verified values to prevent frontend manipulation overrides
    const newOrder = new Order({
      patientId,
      patientName,
      items,
      totalAmount: calculatedTotal, // Enforced server-side calculation
      status: status || "Pending",
      paymentStatus: paymentStatus || "Unpaid",
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      orderID: savedOrder.orderID,
      data: savedOrder,
    });
  } catch (err) {
    res.status(500).json({ message: "Checkout failed", error: err.message });
  }
};

// Fetch orders for a specific patient
exports.getPatientOrders = async (req, res) => {
  try {
    const orders = await Order.find({ patientId: req.params.patientId }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 NEW ERP TELEMETRY PLUG: Feeds the Pharmacy_Management Audit Table logs smoothly

// 🟢 LOGIC CHANNEL A: Aggregates strictly Pharmacy-bound Requisitions
exports.getMedicineProcurementHistory = async (req, res) => {
  try {
    // Query parent documents that contain at least one child node element of type "Medicine"
    const historyLogs = await Order.find({ "items.type": "Medicine" }).sort({ createdAt: -1 });

    const flatMedHistory = [];
    historyLogs.forEach(order => {
      order.items.forEach(item => {
        // Strict separation check: strip away any test items from the table response array
        if (item.type === "Medicine") {
          flatMedHistory.push({
            _id: `${order._id}_${item._id}`, // Generate deterministic unique composite key for React loops
            orderId: order.orderID,
            date: new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }),
            orderedBy: order.patientName,
            staffId: "PATIENT-PORTAL",
            resourceName: item.name,
            quantity: item.quantity,
            status: order.status,
            totalAmount: item.price * item.quantity, // Pure line-item calculation matching your UI
            isVaultOrder: true
          });
        }
      });
    });

    return res.status(200).json(flatMedHistory);
  } catch (err) {
    return res.status(500).json({ message: "Medicine log aggregation failed", error: err.message });
  }
};

// 🟢 LOGIC CHANNEL B: Aggregates strictly Pathology/Lab Requisitions
exports.getTestProcurementHistory = async (req, res) => {
  try {
    // Query parent documents that contain at least one child node element of type "Test"
    const historyLogs = await Order.find({ "items.type": "Test" }).sort({ createdAt: -1 });

    const flatTestHistory = [];
    historyLogs.forEach(order => {
      order.items.forEach(item => {
        // Strict separation check: strip away any medicine items from the table response array
        if (item.type === "Test") {
          flatTestHistory.push({
            _id: `${order._id}_${item._id}`,
            orderId: order.orderID,
            date: new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" }),
            orderedBy: order.patientName,
            staffId: "PATIENT-PORTAL",
            resourceName: item.name,
            quantity: item.quantity,
            status: order.status,
            totalAmount: item.price * item.quantity,
            isVaultOrder: true
          });
        }
      });
    });

    return res.status(200).json(flatTestHistory);
  } catch (err) {
    return res.status(500).json({ message: "Diagnostics log aggregation failed", error: err.message });
  }
};