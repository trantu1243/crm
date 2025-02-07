const express = require('express');
const { bankAccountController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/', authenticateToken, bankAccountController.getBankAccounts);

module.exports = router;