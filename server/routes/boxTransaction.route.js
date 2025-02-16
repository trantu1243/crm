const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { boxTransactionController } = require('../controllers');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/:id', authenticateToken, boxTransactionController.getById);

router.get('/:id/transaction', authenticateToken, boxTransactionController.getTransactionsByBoxId);

router.get('/:id/bill', authenticateToken, boxTransactionController.getBillsByBoxId);

router.post('/:id/undo', authenticateToken, boxTransactionController.undoBox);

router.post('/:id/update', authenticateToken, boxTransactionController.updateBox);

router.post('/:id/lock', authenticateToken, isAdmin, boxTransactionController.switchLock);

router.post('/:id/add-note', authenticateToken, boxTransactionController.addNote);

router.post('/:id/delete-note', authenticateToken, boxTransactionController.deleteNote);

module.exports = router;