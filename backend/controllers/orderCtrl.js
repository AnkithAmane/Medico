const Order = require('../models/Order');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { items, totalAmount, paymentMethod, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const orderNumber = `ORD-${Date.now()}`
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const taxAmount = 50

    const order = await Order.create({
      patientId,
      orderNumber,
      items: items.map(item => ({
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        price: item.price,
        quantity: item.quantity
      })),
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      taxAmount,
      discount: 0,
      totalAmount: totalAmount || subtotal + taxAmount,
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: 'pending',
      deliveryAddress: deliveryAddress || '',
      deliveryStatus: 'pending',
      notes: notes || ''
    });

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully', 
      data: order 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Patient Orders
exports.getPatientOrders = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ patientId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments({ patientId });

    res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Order Details
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Payment status updated', 
      data: order 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Delivery Status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus, trackingNumber, expectedDeliveryDate, actualDeliveryDate } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus, trackingNumber, expectedDeliveryDate, actualDeliveryDate },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Delivery status updated', 
      data: order 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel Order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus: 'cancelled', paymentStatus: 'refunded' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Order cancelled', 
      data: order 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status) query.deliveryStatus = status;

    const orders = await Order.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};