const Product = require('../models/Product');
const Category = require('../models/Category');
const InventoryTransaction = require('../models/InventoryTransaction');

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    const totalProducts = await Product.countDocuments(businessFilter);
    const totalCategories = await Category.countDocuments(businessFilter);

    // Inventory and sales value aggregation
    const valueAgg = await Product.aggregate([
      { $match: businessFilter },
      {
        $group: {
          _id: null,
          inventoryValue: { $sum: { $multiply: ['$quantity', '$buyingPrice'] } },
          salesValue: { $sum: { $multiply: ['$quantity', '$sellingPrice'] } },
        },
      },
    ]);
    const totalInventoryValue = valueAgg[0]?.inventoryValue || 0;
    const potentialSalesValue = valueAgg[0]?.salesValue || 0;
    const expectedProfit = potentialSalesValue - totalInventoryValue;

    // Low stock and out of stock counts
    const lowStockCount = await Product.countDocuments({
      ...businessFilter,
      quantity: { $gt: 0 },
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    });
    const outOfStockCount = await Product.countDocuments({
      ...businessFilter,
      quantity: 0,
    });

    // Current month transaction stats
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const txFilter = { ...businessFilter, month: currentMonth, year: currentYear };

    const stockAddedAgg = await InventoryTransaction.aggregate([
      { $match: { ...txFilter, type: 'IN' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const stockRemovedAgg = await InventoryTransaction.aggregate([
      { $match: { ...txFilter, type: 'OUT' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    const stockAddedThisMonth = stockAddedAgg[0]?.total || 0;
    const stockRemovedThisMonth = stockRemovedAgg[0]?.total || 0;

    res.json({
      totalProducts,
      totalCategories,
      totalInventoryValue,
      potentialSalesValue,
      expectedProfit,
      lowStockCount,
      outOfStockCount,
      stockAddedThisMonth,
      stockRemovedThisMonth,
    });
  } catch (error) {
    console.error('getStats error:', error.message);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

// @desc    Get monthly stock in/out data for current year
// @route   GET /api/dashboard/monthly-stock
// @access  Private
const getMonthlyStock = async (req, res) => {
  try {
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };
    const currentYear = new Date().getFullYear();

    // Aggregate stock IN by month
    const stockInAgg = await InventoryTransaction.aggregate([
      { $match: { ...businessFilter, year: currentYear, type: 'IN' } },
      { $group: { _id: '$month', total: { $sum: '$quantity' } } },
    ]);

    // Aggregate stock OUT by month
    const stockOutAgg = await InventoryTransaction.aggregate([
      { $match: { ...businessFilter, year: currentYear, type: 'OUT' } },
      { $group: { _id: '$month', total: { $sum: '$quantity' } } },
    ]);

    // Convert to maps for easy lookup
    const stockInMap = {};
    stockInAgg.forEach((item) => {
      stockInMap[item._id] = item.total;
    });

    const stockOutMap = {};
    stockOutAgg.forEach((item) => {
      stockOutMap[item._id] = item.total;
    });

    // Build result for all 12 months
    const monthlyData = [];
    for (let i = 1; i <= 12; i++) {
      monthlyData.push({
        month: monthNames[i - 1],
        stockIn: stockInMap[i] || 0,
        stockOut: stockOutMap[i] || 0,
      });
    }

    res.json(monthlyData);
  } catch (error) {
    console.error('getMonthlyStock error:', error.message);
    res.status(500).json({ message: 'Server error fetching monthly stock data' });
  }
};

// @desc    Get yearly growth data
// @route   GET /api/dashboard/yearly-growth
// @access  Private
const getYearlyGrowth = async (req, res) => {
  try {
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    // Get stock IN aggregated by year
    const stockInByYear = await InventoryTransaction.aggregate([
      { $match: { ...businessFilter, type: 'IN' } },
      { $group: { _id: '$year', totalIn: { $sum: '$quantity' } } },
    ]);

    // Get stock OUT aggregated by year
    const stockOutByYear = await InventoryTransaction.aggregate([
      { $match: { ...businessFilter, type: 'OUT' } },
      { $group: { _id: '$year', totalOut: { $sum: '$quantity' } } },
    ]);

    // Merge data by year
    const yearMap = {};
    stockInByYear.forEach((item) => {
      if (!yearMap[item._id]) yearMap[item._id] = { year: item._id, totalIn: 0, totalOut: 0 };
      yearMap[item._id].totalIn = item.totalIn;
    });
    stockOutByYear.forEach((item) => {
      if (!yearMap[item._id]) yearMap[item._id] = { year: item._id, totalIn: 0, totalOut: 0 };
      yearMap[item._id].totalOut = item.totalOut;
    });

    // Calculate net stock per year and sort
    const yearlyData = Object.values(yearMap)
      .map((item) => ({
        year: item.year,
        totalProducts: item.totalIn - item.totalOut,
      }))
      .sort((a, b) => a.year - b.year);

    res.json(yearlyData);
  } catch (error) {
    console.error('getYearlyGrowth error:', error.message);
    res.status(500).json({ message: 'Server error fetching yearly growth data' });
  }
};

// @desc    Get category-wise distribution report
// @route   GET /api/dashboard/category-report
// @access  Private
const getCategoryReport = async (req, res) => {
  try {
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    const categoryAgg = await Product.aggregate([
      { $match: businessFilter },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          name: '$category.name',
          count: 1,
        },
      },
    ]);

    // Calculate total for percentages
    const totalCount = categoryAgg.reduce((sum, item) => sum + item.count, 0);

    const categoryReport = categoryAgg.map((item) => ({
      name: item.name,
      value: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
      count: item.count,
    }));

    res.json(categoryReport);
  } catch (error) {
    console.error('getCategoryReport error:', error.message);
    res.status(500).json({ message: 'Server error fetching category report' });
  }
};

// @desc    Get top moving products (by stock out quantity)
// @route   GET /api/dashboard/top-moving
// @access  Private
const getTopMoving = async (req, res) => {
  try {
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    const topMoving = await InventoryTransaction.aggregate([
      { $match: { ...businessFilter, type: 'OUT' } },
      {
        $group: {
          _id: '$productId',
          totalOut: { $sum: '$quantity' },
        },
      },
      { $sort: { totalOut: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          totalOut: 1,
        },
      },
    ]);

    res.json(topMoving);
  } catch (error) {
    console.error('getTopMoving error:', error.message);
    res.status(500).json({ message: 'Server error fetching top moving products' });
  }
};

// @desc    Get low stock and out of stock products
// @route   GET /api/dashboard/low-stock
// @access  Private
const getLowStock = async (req, res) => {
  try {
    const businessFilter = req.user.role === 'super_admin' ? {} : { businessId: req.user._id };

    const products = await Product.find({
      ...businessFilter,
      $expr: { $lte: ['$quantity', '$minimumStock'] },
    }).populate('categoryId', 'name');

    const lowStockProducts = products.map((product) => ({
      name: product.name,
      currentQuantity: product.quantity,
      minimumStock: product.minimumStock,
      category: product.categoryId?.name || 'N/A',
      status: product.quantity === 0 ? 'Out of Stock' : 'Low Stock',
    }));

    res.json(lowStockProducts);
  } catch (error) {
    console.error('getLowStock error:', error.message);
    res.status(500).json({ message: 'Server error fetching low stock products' });
  }
};

module.exports = {
  getStats,
  getMonthlyStock,
  getYearlyGrowth,
  getCategoryReport,
  getTopMoving,
  getLowStock,
};
