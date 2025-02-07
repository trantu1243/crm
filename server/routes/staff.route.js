const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { staffController } = require('../controllers');

const router = express.Router();

router.get('/', authenticateToken, staffController.getStaffs);

router.get('/:id', authenticateToken, staffController.getById);

router.post('/create', authenticateToken, staffController.createAccount);

router.post('/:id/toggle', authenticateToken, staffController.toggleAccountStatus);

router.post('/:id/update', authenticateToken, staffController.updateAccount);

module.exports = router;