const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { billController } = require('../controllers');

const router = express.Router();

router.get('/:id', authenticateToken, billController.getById);

router.post('/create', authenticateToken, billController.createBill);

router.post('/:id/update', authenticateToken, billController.updateBill);

router.post('/:id/confirm', authenticateToken, billController.confirmBill);

router.post('/:id/cancel', authenticateToken, billController.cancelBill);

module.exports = router;