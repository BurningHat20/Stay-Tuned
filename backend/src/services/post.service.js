const db = require('../config/database');
const { LIMITS } = require('../config/constants');

class PostService {
    async createPost({ channelId, userId, content, postType, mediaUrl }) {
        // Verify channel ownership
        const [channels] = await db.query(
            'SELECT user_id FROM channels WHERE id = ? AND is_active = TRUE',
            [channelId]
        );

        if (channels.length === 0) {
            throw new Error('Channel not found');
        }

        if (channels[0].user_id !== userId) {
            throw new Error('Unauthorized to post to this channel');
        }

        // Validate content length
        if (content.length > LIMITS.POST_CONTENT_MAX_LENGTH) {
            throw new Error(`Post content exceeds maximum length of ${LIMITS.POST_CONTENT_MAX_LENGTH} characters`);
        }

        // Create post
        const [result] = await db.query(
            `INSERT INTO posts (channel_id, user_id, content, post_type, media_url)
       VALUES (?, ?, ?, ?, ?)`,
            [channelId, userId, content, postType || 'text', mediaUrl]
        );

        // Update channel post count
        await db.query(
            'UPDATE channels SET post_count = post_count + 1 WHERE id = ?',
            [channelId]
        );

        // Get the created post with user info
        const [posts] = await db.query(
            `SELECT p.*, u.username, u.full_name, u.avatar_url, c.channel_name, c.channel_handle
       FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN channels c ON p.channel_id = c.id
       WHERE p.id = ?`,
            [result.insertId]
        );

        return posts[0];
    }

    async getChannelPosts(channelId, limit, offset) {
        const [posts] = await db.query(
            `SELECT p.*, u.username, u.full_name, u.avatar_url,
              (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count,
              (SELECT reaction_type FROM reactions WHERE post_id = p.id AND user_id = ?) as user_reaction
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.channel_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
            [null, channelId, limit, offset]
        );

        return posts;
    }

    async getUserFeed(userId, limit, offset) {
        // Get posts from subscribed channels
        const [posts] = await db.query(
            `SELECT p.*, u.username, u.full_name, u.avatar_url, 
              c.channel_name, c.channel_handle,
              (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count,
              (SELECT reaction_type FROM reactions WHERE post_id = p.id AND user_id = ?) as user_reaction
       FROM posts p
       JOIN channels c ON p.channel_id = c.id
       JOIN subscriptions s ON c.id = s.channel_id
       JOIN users u ON p.user_id = u.id
       WHERE s.user_id = ? AND c.is_active = TRUE
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
            [userId, userId, limit, offset]
        );

        return posts;
    }

    async reactToPost(postId, userId, reactionType) {
        const validReactions = ['heart', 'clap', 'fire', 'hundred'];
        if (!validReactions.includes(reactionType)) {
            throw new Error('Invalid reaction type');
        }

        // Check if post exists
        const [posts] = await db.query('SELECT id FROM posts WHERE id = ?', [postId]);
        if (posts.length === 0) {
            throw new Error('Post not found');
        }

        // Insert or update reaction
        await db.query(
            `INSERT INTO reactions (post_id, user_id, reaction_type)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE reaction_type = ?`,
            [postId, userId, reactionType, reactionType]
        );

        // Update post reaction count
        const [count] = await db.query(
            'SELECT COUNT(*) as count FROM reactions WHERE post_id = ?',
            [postId]
        );

        await db.query(
            'UPDATE posts SET reaction_count = ? WHERE id = ?',
            [count[0].count, postId]
        );
    }

    async removeReaction(postId, userId) {
        await db.query(
            'DELETE FROM reactions WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        // Update post reaction count
        const [count] = await db.query(
            'SELECT COUNT(*) as count FROM reactions WHERE post_id = ?',
            [postId]
        );

        await db.query(
            'UPDATE posts SET reaction_count = ? WHERE id = ?',
            [count[0].count, postId]
        );
    }

    async deletePost(postId, userId) {
        // Verify ownership
        const [posts] = await db.query(
            'SELECT user_id, channel_id FROM posts WHERE id = ?',
            [postId]
        );

        if (posts.length === 0) {
            throw new Error('Post not found');
        }

        if (posts[0].user_id !== userId) {
            throw new Error('Unauthorized to delete this post');
        }

        await db.query('DELETE FROM posts WHERE id = ?', [postId]);

        // Update channel post count
        await db.query(
            'UPDATE channels SET post_count = post_count - 1 WHERE id = ?',
            [posts[0].channel_id]
        );
    }
}

module.exports = new PostService();