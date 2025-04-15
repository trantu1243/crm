const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { customerController } = require('../controllers');

const router = express.Router();

router.get('/', customerController.getCustomers);

// router.post('/toggle-white-list/:id', authenticateToken, customerController.toggleWhiteListCustomer);

// router.post('/toggle-black-list/:id', authenticateToken, customerController.toggleBlackListCustomer);

// router.post('/update-tag', authenticateToken, customerController.updateTag);

module.exports = router;