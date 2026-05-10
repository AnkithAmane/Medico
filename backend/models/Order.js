const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    items: [
      {
        itemType: {
          type: String,
          enum: ['medicine', 'test'],  // ← changed diagnosticTest to test
          required: true,
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        itemName: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalItems: Number,
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: Number,
    discount: Number,
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi', 'netbanking', 'wallet', 'cash'],
      default: 'upi'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    deliveryAddress: {
      type: String,
      default: ''
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    notes: String,
    prescriptionFile: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);