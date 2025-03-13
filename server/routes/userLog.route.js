const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');
const { userLogController } = require('../controllers');

const router = express.Router();

router.get('/', userLogController.getLogs);

router.get('/bill', userLogController.getBillLogs);

module.exports = router;