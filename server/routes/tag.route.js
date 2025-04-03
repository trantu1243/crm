const express = require('express');
const authenticateToken = require('../middlewares/authenticateToken');
const isAdmin = require('../middlewares/isAdmin');
const { tagController } = require('../controllers');

const router = express.Router();

router.get('/', authenticateToken, tagController.getTags);

router.get('/filter', authenticateToken, tagController.filterTags);

router.post('/create', authenticateToken, isAdmin, tagController.createTag);

router.post('/:id/update', authenticateToken, isAdmin, tagController.updateTag);

router.post('/:id/delete', authenticateToken, isAdmin, tagController.deleteTag);

module.exports = router;