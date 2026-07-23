const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chat.controller');
const auth = require('../middleware/auth');

router.post('/', auth, handleChat);

module.exports = router;
