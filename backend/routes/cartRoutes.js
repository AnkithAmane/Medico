const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon } = require('../controllers/cartCtrl');
const { protect } = require('../middleware/authMiddleware');
const { cartValidation } = require('../middleware/validation');

router.get('/:patientId', protect, getCart);
router.post('/:patientId/add', protect, ...cartValidation.addToCart, addToCart);
router.put('/:patientId/update/:itemId', protect, updateQuantity);
router.delete('/:patientId/remove/:itemId', protect, removeFromCart);
router.post('/:patientId/coupon', protect, applyCoupon);
router.delete('/:patientId/clear', protect, clearCart);

module.exports = router;
