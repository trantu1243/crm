const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { staffController } = require('../controllers');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/', authenticateToken, staffController.getStaffs);

router.get('/all', authenticateToken, isAdmin, staffController.getAllStaffs);

router.get('/:id', authenticateToken, isAdmin, staffController.getById);

router.post('/create', authenticateToken, isAdmin, staffController.createAccount);

router.post('/:id/toggle', authenticateToken, isAdmin, staffController.toggleAccountStatus);

router.post('/:id/update', authenticateToken, isAdmin, staffController.updateAccount);

module.exports = router;