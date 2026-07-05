const express = require('express');
const router = express.Router();
const {
  inventorySummary,
  monthlyReport,
  yearlyReport,
  lowStockReport,
} = require('../controllers/report.controller');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/inventory-summary', inventorySummary);
router.get('/monthly', monthlyReport);
router.get('/yearly', yearlyReport);
router.get('/low-stock', lowStockReport);

module.exports = router;
