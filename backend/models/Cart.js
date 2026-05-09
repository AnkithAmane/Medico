const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true,
    },
    items: [
      {
        itemType: {
          type: String,
          enum: ['medicine', 'diagnosticTest'],
          required: true,
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        itemName: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: String,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
