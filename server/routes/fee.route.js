const express = require('express');
const { feeController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/', authenticateToken, feeController.getFeeTransactions);

router.post('/create', authenticateToken, isAdmin, feeController.createFeeTransaction);

router.post('/:id/update', authenticateToken, isAdmin, feeController.updateFeeTransaction);

router.post('/:id/delete', authenticateToken, isAdmin, feeController.deleteFeeTransaction);

module.exports = router;