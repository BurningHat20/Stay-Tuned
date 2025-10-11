const express = require('express');
const { body, param, query } = require('express-validator');
const channelController = require('../controllers/channel.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.post(
    '/',
    authenticateToken,
    [
        body('channelName').trim().isLength({ min: 1, max: 100 }).withMessage('Channel name is required'),
        body('channelHandle')
            .trim()
            .isLength({ min: 3, max: 50 })
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Invalid channel handle'),
        body('description').optional().trim().isLength({ max: 500 }),
        body('channelType').optional().isIn(['personal', 'professional', 'interest', 'event', 'business']),
        body('category').optional().trim().isLength({ max: 50 }),
        body('isPrivate').optional().isBoolean()
    ],
    validate,
    channelController.createChannel
);

router.get('/discover', optionalAuth, channelController.discoverChannels);
router.get('/trending', optionalAuth, channelController.getTrendingChannels);
router.get('/my-channels', authenticateToken, channelController.getMyChannels);
router.get('/user/:userId', channelController.getUserChannels);
router.get('/handle/:handle', optionalAuth, channelController.getChannelByHandle);
router.get('/:channelId', optionalAuth, channelController.getChannel);

router.patch(
    '/:channelId',
    authenticateToken,
    [
        body('channelName').optional().trim().isLength({ min: 1, max: 100 }),
        body('description').optional().trim().isLength({ max: 500 }),
        body('category').optional().trim().isLength({ max: 50 }),
        body('isPrivate').optional().isBoolean(),
        body('coverImageUrl').optional().isURL()
    ],
    validate,
    channelController.updateChannel
);

router.delete('/:channelId', authenticateToken, channelController.deleteChannel);

module.exports = router;