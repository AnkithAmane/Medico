const Cart = require('../models/Cart');
const Medicine = require('../models/Medicine');
const DiagnosticTest = require('../models/DiagnosticTest');

// Get Cart
exports.getCart = async (req, res) => {
  try {
    const { patientId } = req.params;

    let cart = await Cart.findOne({ patientId });
    if (!cart) {
      cart = await Cart.create({ patientId, items: [] });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { itemType, itemId, quantity = 1 } = req.body;

    // Verify item exists and get price
    let item;
    if (itemType === 'medicine') {
      item = await Medicine.findById(itemId);
    } else if (itemType === 'diagnosticTest') {
      item = await DiagnosticTest.findById(itemId);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type' });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    let cart = await Cart.findOne({ patientId });
    if (!cart) {
      cart = await Cart.create({ patientId, items: [] });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(i => i.itemId.toString() === itemId && i.itemType === itemType);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        itemType,
        itemId,
        itemName: item.medicineName || item.testName,
        price: item.price,
        quantity,
      });
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.taxAmount = cart.totalPrice * 0.05; // 5% tax
    cart.lastUpdated = new Date();

    await cart.save();

    res.status(200).json({ success: true, message: 'Item added to cart', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { patientId, itemId } = req.params;

    let cart = await Cart.findOne({ patientId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.itemId.toString() !== itemId);

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.taxAmount = cart.totalPrice * 0.05;
    cart.lastUpdated = new Date();

    await cart.save();

    res.status(200).json({ success: true, message: 'Item removed from cart', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Item Quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { patientId, itemId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ patientId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find(i => i.itemId.toString() === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);
    } else {
      item.quantity = quantity;
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cart.taxAmount = cart.totalPrice * 0.05;
    cart.lastUpdated = new Date();

    await cart.save();

    res.status(200).json({ success: true, message: 'Quantity updated', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear Cart
exports.clearCart = async (req, res) => {
  try {
    const { patientId } = req.params;

    let cart = await Cart.findOne({ patientId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.taxAmount = 0;
    cart.discount = 0;
    cart.couponCode = null;
    cart.lastUpdated = new Date();

    await cart.save();

    res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Apply Coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { couponCode, discountAmount } = req.body;

    let cart = await Cart.findOne({ patientId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.couponCode = couponCode;
    cart.discount = discountAmount;
    cart.lastUpdated = new Date();

    await cart.save();

    res.status(200).json({ success: true, message: 'Coupon applied', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
