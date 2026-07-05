const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Business ID is required'],
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required'],
  },
  type: {
    type: String,
    enum: ['IN', 'OUT'],
    required: [true, 'Transaction type is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
  },
  previousQuantity: {
    type: Number,
  },
  updatedQuantity: {
    type: Number,
  },
  reason: {
    type: String,
  },
  month: {
    type: Number,
  },
  year: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
