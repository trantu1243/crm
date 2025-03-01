const express = require('express');
const { bankAccountController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');

const router = express.Router();

router.get('/', authenticateToken, bankAccountController.getBankAccounts);

router.post('/create', authenticateToken, isAdmin, bankAccountController.createBankAccount);

router.post('/:id/update', authenticateToken, isAdmin, bankAccountController.getBankAccounts);

router.post('/:id/delete', authenticateToken, isAdmin, bankAccountController.getBankAccounts);

module.exports = router;