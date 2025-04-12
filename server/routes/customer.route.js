const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { customerController } = require('../controllers');

const router = express.Router();

router.get('/', customerController.getCustomers);

module.exports = router;