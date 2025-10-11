const express = require('express');
const userController = require('../controllers/user.controller');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/search', optionalAuth, userController.searchUsers);
router.get('/:userId', optionalAuth, userController.getUser);

module.exports = router;