const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { sendLowStockEmail } = require('../utils/sendEmail');

// @desc    Stock In - Add stock to a product
// @route   POST /api/inventory/stock-in
// @access  Private
const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and a positive quantity are required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership (unless super_admin)
    if (req.user.role !== 'super_admin' && product.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const previousQuantity = product.quantity;
    const updatedQuantity = product.quantity + quantity;

    // Update product quantity
    product.quantity = updatedQuantity;
    await product.save();

    // Create inventory transaction
    const now = new Date();
    const transaction = await InventoryTransaction.create({
      businessId: product.businessId,
      productId: product._id,
      type: 'IN',
      quantity,
      previousQuantity,
      updatedQuantity,
      reason: reason || 'Stock In',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    res.status(201).json({
      message: 'Stock added successfully',
      transaction,
      product: {
        id: product._id,
        name: product.name,
        previousQuantity,
        updatedQuantity,
      },
    });
  } catch (error) {
    console.error('stockIn error:', error.message);
    res.status(500).json({ message: 'Server error during stock in' });
  }
};

// @desc    Stock Out - Remove stock from a product
// @route   POST /api/inventory/stock-out
// @access  Private
const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Product ID and a positive quantity are required' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership (unless super_admin)
    if (req.user.role !== 'super_admin' && product.businessId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    // Validate enough stock
    if (product.quantity < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`,
      });
    }

    const previousQuantity = product.quantity;
    const updatedQuantity = product.quantity - quantity;

    // Update product quantity
    product.quantity = updatedQuantity;
    await product.save();

    // Create inventory transaction
    const now = new Date();
    const transaction = await InventoryTransaction.create({
      businessId: product.businessId,
      productId: product._id,
      type: 'OUT',
      quantity,
      previousQuantity,
      updatedQuantity,
      reason: reason || 'Stock Out',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    // Check if stock just dropped to or below minimum threshold
    console.log(`[Email Debug] stockOut check:`);
    console.log(`[Email Debug] updatedQuantity (${updatedQuantity}) <= minimumStock (${product.minimumStock})? -> ${updatedQuantity <= product.minimumStock}`);
    console.log(`[Email Debug] previousQuantity (${previousQuantity}) > minimumStock (${product.minimumStock})? -> ${previousQuantity > product.minimumStock}`);

    if (updatedQuantity <= product.minimumStock && previousQuantity > product.minimumStock) {
      console.log(`[Email Debug] Condition met! Triggering sendLowStockEmail...`);
      const destinationEmail = process.env.NOTIFICATION_EMAIL || 'makawarmayuresh0@gmail.com';
      sendLowStockEmail(destinationEmail, {
        name: product.name,
        quantity: updatedQuantity,
        minimumStock: product.minimumStock
      }).catch(err => console.error('Failed to trigger email asynchronously', err));
    } else {
      console.log(`[Email Debug] Condition NOT met. Email skipped.`);
    }

    res.status(201).json({
      message: 'Stock removed successfully',
      transaction,
      product: {
        id: product._id,
        name: product.name,
        previousQuantity,
        updatedQuantity,
      },
    });
  } catch (error) {
    console.error('stockOut error:', error.message);
    res.status(500).json({ message: 'Server error during stock out' });
  }
};

// @desc    Get all inventory transactions
// @route   GET /api/inventory
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const filter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };
    const transactions = await InventoryTransaction.find(filter)
      .populate('productId', 'name sku')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('getTransactions error:', error.message);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

module.exports = { stockIn, stockOut, getTransactions };
