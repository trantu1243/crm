const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { boxTransactionController } = require('../controllers');

const router = express.Router();

router.get('/:id', authenticateToken, boxTransactionController.getById);

router.get('/:id/transaction', authenticateToken, boxTransactionController.getTransactionsByBoxId);

router.get('/:id/bill', authenticateToken, boxTransactionController.getBillsByBoxId);

router.post('/:id/undo', authenticateToken, boxTransactionController.undoBox);

module.exports = router;