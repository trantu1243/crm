const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { transactionController } = require('../controllers');

const router = express.Router();

router.get('/', authenticateToken, transactionController.getTransactions);

router.get('/:id', authenticateToken, transactionController.getById);

router.post('/create', authenticateToken, transactionController.createTransaction);

router.post('/:id/update', authenticateToken, transactionController.updateTransaction);

router.post('/:id/confirm', authenticateToken, transactionController.confirmTransaction);

router.post('/:id/cancel', authenticateToken, transactionController.cancelTransaction);

module.exports = router;