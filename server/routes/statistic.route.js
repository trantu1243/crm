const express = require('express');
const { statisticController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();

router.get('/monthly', authenticateToken, isAdmin, statisticController.getMonthlyStats);
router.get('/daily', authenticateToken, isAdmin, statisticController.getDailyStats);
router.get('/balance', authenticateToken, isAdmin, statisticController.getBalance);

router.get('/staff-monthly', authenticateToken, isAdmin, statisticController.getStaffMonthlyStats);
router.get('/staff-daily', authenticateToken, isAdmin, statisticController.getDailyBankStatsByStaff);

module.exports = router;