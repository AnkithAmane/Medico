const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { paymentMethod, deliveryAddress, notes, prescriptionFile } = req.body;

    // Get cart
    const cart = await Cart.findOne({ patientId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const order = await Order.create({
      patientId,
      orderNumber,
      items: cart.items,
      totalItems: cart.totalItems,
      subtotal: cart.totalPrice,
      taxAmount: cart.taxAmount,
      discount: cart.discount,
      totalAmount: cart.totalPrice + cart.taxAmount - cart.discount,
      paymentMethod,
      paymentStatus: 'pending',
      deliveryAddress,
      deliveryStatus: 'pending',
      notes,
      prescriptionFile,
    });

    // Clear cart
    await Cart.updateOne({ patientId }, {
      $set: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        taxAmount: 0,
        discount: 0,
        couponCode: null,
      },
    });

    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
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

    res.status(200).json({ success: true, message: 'Payment status updated', data: order });
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
      {
        deliveryStatus,
        trackingNumber,
        expectedDeliveryDate,
        actualDeliveryDate,
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({ success: true, message: 'Delivery status updated', data: order });
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

    res.status(200).json({ success: true, message: 'Order cancelled', data: order });
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
