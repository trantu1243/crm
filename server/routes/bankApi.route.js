const express = require('express');
const { bankApiController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/', authenticateToken, bankApiController.getBankApis);

module.exports = router;