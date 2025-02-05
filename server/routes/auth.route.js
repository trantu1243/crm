const express = require('express');
const { authController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/login', authController.login);

router.post('/verify-token', authenticateToken, authController.authToken);

module.exports = router;