const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      default: 0,
    },
    minimumStock: {
      type: Number,
      default: 10,
    },
    buyingPrice: {
      type: Number,
      required: [true, 'Buying price is required'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on [businessId, sku]
productSchema.index({ businessId: 1, sku: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
