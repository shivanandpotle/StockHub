const express = require('express');
const router = express.Router();
const { stockIn, stockOut, getTransactions } = require('../controllers/inventory.controller');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.get('/', getTransactions);
router.post('/stock-in', stockIn);
router.post('/stock-out', stockOut);

module.exports = router;
