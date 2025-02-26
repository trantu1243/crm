const express = require('express');
const { statisticController } = require('../controllers');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');
const router = express.Router();

router.get('/monthly', authenticateToken, isAdmin, statisticController.getMonthlyStats);
router.get('/daily', authenticateToken, isAdmin, statisticController.getDailyStats);
router.get('/balance', authenticateToken, isAdmin, statisticController.listActiveBoxAmountByBank);

router.get('/staff-monthly', authenticateToken, statisticController.getStaffMonthlyStats);
router.get('/staff-daily', authenticateToken, statisticController.getDailyBankStatsByStaff);
router.get('/staff-transaction', authenticateToken, statisticController.getTransactionStatsByStaff);

router.get('/staff-balance', authenticateToken, statisticController.listActiveBoxAmountByStaff);
router.get('/staff-kpi-monthly', authenticateToken, statisticController.getStaffShareInMonth);
router.get('/staff-kpi-daily', authenticateToken, statisticController.getDailyShareOfStaff);

module.exports = router;