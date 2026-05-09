const express = require('express');
const router = express.Router();
const { createOrder, getPatientOrders, getOrderDetails, updatePaymentStatus, updateDeliveryStatus, cancelOrder, getAllOrders } = require('../controllers/orderCtrl');
const { protect, authorize } = require('../middleware/authMiddleware');
const { orderValidation } = require('../middleware/validation');

router.get('/', protect, authorize('admin'), getAllOrders);
router.post('/:patientId/create', protect, ...orderValidation.create, createOrder);
router.get('/details/:orderId', protect, getOrderDetails);
router.put('/:orderId/payment', protect, updatePaymentStatus);
router.put('/:orderId/delivery', protect, updateDeliveryStatus);
router.put('/:orderId/cancel', protect, cancelOrder);
router.get('/:patientId', protect, getPatientOrders);

module.exports = router;
