const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');
const { tagController } = require('../controllers');

const router = express.Router();

router.get('/', authenticateToken, tagController.getTags);

router.post('/create', authenticateToken, isAdmin, tagController.createTag);

router.post('/update', authenticateToken, isAdmin, tagController.updateTag);

module.exports = router;