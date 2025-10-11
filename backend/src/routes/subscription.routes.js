const express = require('express');
const { body, param } = require('express-validator');
const subscriptionController = require('../controllers/subscription.controller');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.post(
    '/:channelId',
    authenticateToken,
    [
        body('notificationLevel').optional().isIn(['all', 'important', 'none'])
    ],
    validate,
    subscriptionController.subscribe
);

router.delete('/:channelId', authenticateToken, subscriptionController.unsubscribe);
router.get('/', authenticateToken, subscriptionController.getSubscriptions);
router.get('/:channelId/subscribers', subscriptionController.getChannelSubscribers);

router.patch(
    '/:channelId/notifications',
    authenticateToken,
    [
        body('notificationLevel').isIn(['all', 'important', 'none'])
    ],
    validate,
    subscriptionController.updateNotificationLevel
);

module.exports = router;