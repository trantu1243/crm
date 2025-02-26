const express = require('express');
const { authController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/login', authController.login);

router.post('/verify-token', authenticateToken, authController.authToken);

router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;