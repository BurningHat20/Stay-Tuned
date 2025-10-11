const db = require('../config/database');
const { getIO } = require('../websocket/handlers');

class NotificationService {
    async notifyChannelSubscribers(channelId, post) {
        // Get all subscribers with notification level 'all' or 'important'
        const [subscribers] = await db.query(
            `SELECT s.user_id, s.notification_level
       FROM subscriptions s
       WHERE s.channel_id = ? AND s.notification_level != 'none'`,
            [channelId]
        );

        const io = getIO();

        // Emit to each subscriber
        for (const subscriber of subscribers) {
            // Emit via WebSocket if connected
            io.to(`user_${subscriber.user_id}`).emit('new_post', {
                channelId,
                post
            });

            // Create notification record
            await db.query(
                `INSERT INTO notifications (user_id, channel_id, post_id, type, title, message)
         VALUES (?, ?, ?, 'new_post', ?, ?)`,
                [
                    subscriber.user_id,
                    channelId,
                    post.id,
                    `New post in ${post.channel_name}`,
                    post.content.substring(0, 100)
                ]
            );
        }
    }

    async getUserNotifications(userId, limit, offset) {
        const [notifications] = await db.query(
            `SELECT n.*, c.channel_name, c.channel_handle
       FROM notifications n
       LEFT JOIN channels c ON n.channel_id = c.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        return notifications;
    }

    async markAsRead(notificationId, userId) {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [notificationId, userId]
        );
    }

    async markAllAsRead(userId) {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );
    }

    async getUnreadCount(userId) {
        const [result] = await db.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
            [userId]
        );

        return result[0].count;
    }
}

module.exports = new NotificationService();