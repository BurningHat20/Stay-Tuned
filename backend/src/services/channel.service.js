const db = require('../config/database');
const { LIMITS } = require('../config/constants');

class ChannelService {
    async createChannel(channelData) {
        const { userId, channelName, channelHandle, description, channelType, category, isPrivate } = channelData;

        // Check channel limit based on account type
        const [user] = await db.query('SELECT account_type FROM users WHERE id = ?', [userId]);
        const accountType = user[0].account_type;

        const [existingChannels] = await db.query(
            'SELECT COUNT(*) as count FROM channels WHERE user_id = ? AND is_active = TRUE',
            [userId]
        );

        const channelCount = existingChannels[0].count;
        const limit = LIMITS[`${accountType.toUpperCase()}_CHANNELS`];

        if (channelCount >= limit) {
            throw new Error(`Channel limit reached for ${accountType} account (${limit} channels)`);
        }

        // Check if handle is available
        const [existing] = await db.query(
            'SELECT id FROM channels WHERE channel_handle = ?',
            [channelHandle]
        );

        if (existing.length > 0) {
            throw new Error('Channel handle already taken');
        }

        // Create channel
        const [result] = await db.query(
            `INSERT INTO channels 
       (user_id, channel_name, channel_handle, description, channel_type, category, is_private)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, channelName, channelHandle, description, channelType || 'personal', category, isPrivate || false]
        );

        return this.getChannelById(result.insertId);
    }

    async getChannelById(channelId, requestUserId = null) {
        const [channels] = await db.query(
            `SELECT c.*, u.username, u.full_name, u.avatar_url, u.is_verified,
              ${requestUserId ? `EXISTS(
                SELECT 1 FROM subscriptions 
                WHERE user_id = ? AND channel_id = c.id
              ) as is_subscribed` : 'FALSE as is_subscribed'}
       FROM channels c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ? AND c.is_active = TRUE`,
            requestUserId ? [requestUserId, channelId] : [channelId]
        );

        if (channels.length === 0) {
            throw new Error('Channel not found');
        }

        return channels[0];
    }

    async getChannelByHandle(handle, requestUserId = null) {
        const [channels] = await db.query(
            `SELECT c.*, u.username, u.full_name, u.avatar_url, u.is_verified,
              ${requestUserId ? `EXISTS(
                SELECT 1 FROM subscriptions 
                WHERE user_id = ? AND channel_id = c.id
              ) as is_subscribed` : 'FALSE as is_subscribed'}
       FROM channels c
       JOIN users u ON c.user_id = u.id
       WHERE c.channel_handle = ? AND c.is_active = TRUE`,
            requestUserId ? [requestUserId, handle] : [handle]
        );

        if (channels.length === 0) {
            throw new Error('Channel not found');
        }

        return channels[0];
    }

    async updateChannel(channelId, userId, updates) {
        // Verify ownership
        const [channels] = await db.query(
            'SELECT user_id FROM channels WHERE id = ?',
            [channelId]
        );

        if (channels.length === 0) {
            throw new Error('Channel not found');
        }

        if (channels[0].user_id !== userId) {
            throw new Error('Unauthorized to update this channel');
        }

        const allowedFields = ['channel_name', 'description', 'category', 'is_private', 'cover_image_url'];
        const updateFields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(channelId);

        await db.query(
            `UPDATE channels SET ${updateFields.join(', ')} WHERE id = ?`,
            values
        );

        return this.getChannelById(channelId);
    }

    async deleteChannel(channelId, userId) {
        const [channels] = await db.query(
            'SELECT user_id FROM channels WHERE id = ?',
            [channelId]
        );

        if (channels.length === 0) {
            throw new Error('Channel not found');
        }

        if (channels[0].user_id !== userId) {
            throw new Error('Unauthorized to delete this channel');
        }

        // Soft delete
        await db.query(
            'UPDATE channels SET is_active = FALSE WHERE id = ?',
            [channelId]
        );
    }

    async getUserChannels(userId) {
        const [channels] = await db.query(
            `SELECT c.*, 
              (SELECT COUNT(*) FROM posts WHERE channel_id = c.id) as post_count
       FROM channels c
       WHERE c.user_id = ? AND c.is_active = TRUE
       ORDER BY c.created_at DESC`,
            [userId]
        );

        return channels;
    }

    async discoverChannels({ category, search, limit, offset, excludeUserId }) {
        let query = `
      SELECT c.*, u.username, u.full_name, u.avatar_url, u.is_verified
      FROM channels c
      JOIN users u ON c.user_id = u.id
      WHERE c.is_active = TRUE AND c.is_private = FALSE
    `;
        const params = [];

        if (excludeUserId) {
            query += ' AND c.user_id != ?';
            params.push(excludeUserId);
        }

        if (category) {
            query += ' AND c.category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (c.channel_name LIKE ? OR c.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY c.subscriber_count DESC, c.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [channels] = await db.query(query, params);
        return channels;
    }

    async getTrendingChannels(limit) {
        // Get channels with most activity in last 7 days
        const [channels] = await db.query(
            `SELECT c.*, u.username, u.full_name, u.avatar_url, u.is_verified,
              COUNT(p.id) as recent_posts
       FROM channels c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN posts p ON c.id = p.channel_id AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       WHERE c.is_active = TRUE AND c.is_private = FALSE
       GROUP BY c.id
       ORDER BY recent_posts DESC, c.subscriber_count DESC
       LIMIT ?`,
            [limit]
        );

        return channels;
    }
}

module.exports = new ChannelService();