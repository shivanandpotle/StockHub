const express = require('express');
const router = express.Router();
const {
  getStats,
  getMonthlyStock,
  getYearlyGrowth,
  getCategoryReport,
  getTopMoving,
  getLowStock,
} = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/stats', getStats);
router.get('/monthly-stock', getMonthlyStock);
router.get('/yearly-growth', getYearlyGrowth);
router.get('/category-report', getCategoryReport);
router.get('/top-moving', getTopMoving);
router.get('/low-stock', getLowStock);

module.exports = router;
