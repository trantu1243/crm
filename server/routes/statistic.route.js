const express = require('express');
const { statisticController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();

router.get('/monthly', authenticateToken, isAdmin, statisticController.getMonthlyStats);
router.get('/daily', authenticateToken, isAdmin, statisticController.getDailyStats);

module.exports = router;