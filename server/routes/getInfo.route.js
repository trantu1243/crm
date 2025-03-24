const express = require('express');
const { getInfoController } = require('../controllers');
const apiAuthMiddleware = require('../middlewares/apiAuth');
const authenticateToken = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/check/:code', apiAuthMiddleware, getInfoController.checkTransaction);

router.get('/fb-account', apiAuthMiddleware, getInfoController.getGDAccount);

router.get('/banks', apiAuthMiddleware, getInfoController.getBanks);

router.get('/box/:id', apiAuthMiddleware, getInfoController.getTransactions);

router.post('/gen-qr', apiAuthMiddleware, getInfoController.genQr);

router.post('/check-uid', authenticateToken, getInfoController.checkUIDFacebook);

module.exports = router;