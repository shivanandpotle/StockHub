const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const {
  generateInventorySummaryPDF,
  generateMonthlyReportPDF,
  generateYearlyReportPDF,
  generateLowStockPDF,
} = require('../utils/pdfGenerator');
const {
  generateInventorySummaryExcel,
  generateMonthlyReportExcel,
  generateYearlyReportExcel,
  generateLowStockExcel,
} = require('../utils/excelGenerator');

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// @desc    Generate Inventory Summary Report
// @route   GET /api/reports/inventory-summary
// @access  Private
const inventorySummary = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    const products = await Product.find(businessFilter).populate('categoryId', 'name');
    const transactions = await InventoryTransaction.find(businessFilter)
      .populate('productId', 'name sku')
      .sort({ createdAt: -1 });
    const lowStockProducts = await Product.find({
      ...businessFilter,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    }).populate('categoryId', 'name');

    if (format === 'excel') {
      return await generateInventorySummaryExcel(products, transactions, lowStockProducts, res);
    }

    // PDF
    const totalProducts = products.length;
    const totalInventoryValue = products.reduce((sum, p) => sum + p.quantity * p.buyingPrice, 0);
    const potentialSalesValue = products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
    const expectedProfit = potentialSalesValue - totalInventoryValue;

    const stats = { totalProducts, totalInventoryValue, expectedProfit };
    await generateInventorySummaryPDF(products, stats, res);
  } catch (error) {
    console.error('inventorySummary error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating inventory summary report' });
    }
  }
};

// @desc    Generate Monthly Report
// @route   GET /api/reports/monthly
// @access  Private
const monthlyReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    const transactions = await InventoryTransaction.find({
      ...businessFilter,
      month,
      year,
    })
      .populate('productId', 'name sku')
      .sort({ createdAt: -1 });

    if (format === 'excel') {
      return await generateMonthlyReportExcel(transactions, res);
    }

    await generateMonthlyReportPDF(transactions, month, year, res);
  } catch (error) {
    console.error('monthlyReport error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating monthly report' });
    }
  }
};

// @desc    Generate Yearly Report
// @route   GET /api/reports/yearly
// @access  Private
const yearlyReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    // Get monthly breakdown for the year
    const stockInAgg = await InventoryTransaction.aggregate([
      { $match: { ...businessFilter, year, type: 'IN' } },
      { $group: { _id: '$month', total: { $sum: '$quantity' } } },
    ]);

    const stockOutAgg = await InventoryTransaction.aggregate([
      { $match: { ...businessFilter, year, type: 'OUT' } },
      { $group: { _id: '$month', total: { $sum: '$quantity' } } },
    ]);

    const stockInMap = {};
    stockInAgg.forEach((item) => { stockInMap[item._id] = item.total; });
    const stockOutMap = {};
    stockOutAgg.forEach((item) => { stockOutMap[item._id] = item.total; });

    const monthlyData = [];
    for (let i = 1; i <= 12; i++) {
      monthlyData.push({
        month: monthNames[i - 1],
        stockIn: stockInMap[i] || 0,
        stockOut: stockOutMap[i] || 0,
      });
    }

    if (format === 'excel') {
      return await generateYearlyReportExcel(monthlyData, res);
    }

    await generateYearlyReportPDF(monthlyData, year, res);
  } catch (error) {
    console.error('yearlyReport error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating yearly report' });
    }
  }
};

// @desc    Generate Low Stock Report
// @route   GET /api/reports/low-stock
// @access  Private
const lowStockReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    const products = await Product.find({
      ...businessFilter,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    }).populate('categoryId', 'name');

    if (format === 'excel') {
      return await generateLowStockExcel(products, res);
    }

    await generateLowStockPDF(products, res);
  } catch (error) {
    console.error('lowStockReport error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating low stock report' });
    }
  }
};

module.exports = { inventorySummary, monthlyReport, yearlyReport, lowStockReport };
