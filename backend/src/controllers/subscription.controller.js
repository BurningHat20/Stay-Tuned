const subscriptionService = require('../services/subscription.service');
const logger = require('../utils/logger');

class SubscriptionController {
    async subscribe(req, res, next) {
        try {
            const { channelId } = req.params;
            const { notificationLevel } = req.body;

            await subscriptionService.subscribe(
                req.user.id,
                channelId,
                notificationLevel
            );

            logger.info(`User ${req.user.id} subscribed to channel ${channelId}`);

            res.status(201).json({
                message: 'Subscribed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async unsubscribe(req, res, next) {
        try {
            const { channelId } = req.params;

            await subscriptionService.unsubscribe(req.user.id, channelId);

            res.json({ message: 'Unsubscribed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getSubscriptions(req, res, next) {
        try {
            const subscriptions = await subscriptionService.getUserSubscriptions(req.user.id);

            res.json({ subscriptions });
        } catch (error) {
            next(error);
        }
    }

    async getChannelSubscribers(req, res, next) {
        try {
            const { channelId } = req.params;
            const { limit = 50, offset = 0 } = req.query;

            const subscribers = await subscriptionService.getChannelSubscribers(
                channelId,
                parseInt(limit),
                parseInt(offset)
            );

            res.json({ subscribers });
        } catch (error) {
            next(error);
        }
    }

    async updateNotificationLevel(req, res, next) {
        try {
            const { channelId } = req.params;
            const { notificationLevel } = req.body;

            await subscriptionService.updateNotificationLevel(
                req.user.id,
                channelId,
                notificationLevel
            );

            res.json({
                message: 'Notification level updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SubscriptionController();