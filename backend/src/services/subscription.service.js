const db = require('../config/database');

class SubscriptionService {
    async subscribe(userId, channelId, notificationLevel = 'all') {
        // Check if channel exists
        const [channels] = await db.query(
            'SELECT id, is_private FROM channels WHERE id = ? AND is_active = TRUE',
            [channelId]
        );

        if (channels.length === 0) {
            throw new Error('Channel not found');
        }

        // Check if already subscribed
        const [existing] = await db.query(
            'SELECT id FROM subscriptions WHERE user_id = ? AND channel_id = ?',
            [userId, channelId]
        );

        if (existing.length > 0) {
            throw new Error('Already subscribed to this channel');
        }

        // Create subscription
        await db.query(
            `INSERT INTO subscriptions (user_id, channel_id, notification_level)
       VALUES (?, ?, ?)`,
            [userId, channelId, notificationLevel]
        );

        // Update channel subscriber count
        await db.query(
            'UPDATE channels SET subscriber_count = subscriber_count + 1 WHERE id = ?',
            [channelId]
        );
    }

    async unsubscribe(userId, channelId) {
        const [result] = await db.query(
            'DELETE FROM subscriptions WHERE user_id = ? AND channel_id = ?',
            [userId, channelId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Subscription not found');
        }

        // Update channel subscriber count
        await db.query(
            'UPDATE channels SET subscriber_count = GREATEST(0, subscriber_count - 1) WHERE id = ?',
            [channelId]
        );
    }

    async getUserSubscriptions(userId) {
        const [subscriptions] = await db.query(
            `SELECT c.*, u.username, u.full_name, u.avatar_url, u.is_verified,
              s.notification_level, s.created_at as subscribed_at
       FROM subscriptions s
       JOIN channels c ON s.channel_id = c.id
       JOIN users u ON c.user_id = u.id
       WHERE s.user_id = ? AND c.is_active = TRUE
       ORDER BY s.created_at DESC`,
            [userId]
        );

        return subscriptions;
    }

    async getChannelSubscribers(channelId, limit, offset) {
        const [subscribers] = await db.query(
            `SELECT u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
              s.notification_level, s.created_at as subscribed_at
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       WHERE s.channel_id = ?
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
            [channelId, limit, offset]
        );

        return subscribers;
    }

    async updateNotificationLevel(userId, channelId, notificationLevel) {
        const validLevels = ['all', 'important', 'none'];
        if (!validLevels.includes(notificationLevel)) {
            throw new Error('Invalid notification level');
        }

        const [result] = await db.query(
            'UPDATE subscriptions SET notification_level = ? WHERE user_id = ? AND channel_id = ?',
            [notificationLevel, userId, channelId]
        );

        if (result.affectedRows === 0) {
            throw new Error('Subscription not found');
        }
    }

    async isSubscribed(userId, channelId) {
        const [result] = await db.query(
            'SELECT id FROM subscriptions WHERE user_id = ? AND channel_id = ?',
            [userId, channelId]
        );

        return result.length > 0;
    }
}

module.exports = new SubscriptionService();