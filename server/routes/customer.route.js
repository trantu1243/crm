const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const { customerController } = require('../controllers');

const router = express.Router();

router.get('/', customerController.getCustomers);

router.post('/toggle-white-list/:id', authenticateToken, customerController.toggleWhitelist);

router.post('/toggle-black-list/:id', authenticateToken, customerController.toggleBlacklist);

router.post('/update-tag', authenticateToken, customerController.updateTag);

router.post('update-note', authenticateToken, customerController.updateNote);

module.exports = router;