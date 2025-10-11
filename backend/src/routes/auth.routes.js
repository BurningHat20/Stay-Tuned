const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
    '/register',
    authLimiter,
    [
        body('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
        body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('fullName').optional().trim().isLength({ max: 100 })
    ],
    validate,
    authController.register
);

router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    authController.login
);

router.get('/profile', authenticateToken, authController.getProfile);

router.patch(
    '/profile',
    authenticateToken,
    [
        body('fullName').optional().trim().isLength({ max: 100 }),
        body('bio').optional().trim().isLength({ max: 500 }),
        body('avatarUrl').optional().isURL()
    ],
    validate,
    authController.updateProfile
);

router.patch(
    '/status',
    authenticateToken,
    [
        body('status').isIn(['online', 'away', 'busy', 'offline'])
    ],
    validate,
    authController.updateStatus
);

module.exports = router;