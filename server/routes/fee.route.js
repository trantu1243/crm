const express = require('express');
const { feeController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/', authenticateToken, feeController.getFeeTransactions);

module.exports = router;