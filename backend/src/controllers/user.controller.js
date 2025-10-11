const db = require('../config/database');

class UserController {
    async searchUsers(req, res, next) {
        try {
            const { q, limit = 20 } = req.query;

            if (!q || q.trim().length < 2) {
                return res.json({ users: [] });
            }

            const searchTerm = `%${q}%`;
            const [users] = await db.query(
                `SELECT id, username, full_name, bio, avatar_url, is_verified
         FROM users
         WHERE username LIKE ? OR full_name LIKE ?
         LIMIT ?`,
                [searchTerm, searchTerm, parseInt(limit)]
            );

            res.json({ users });
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const { userId } = req.params;

            const [users] = await db.query(
                `SELECT id, username, full_name, bio, avatar_url, is_verified, 
                account_type, created_at
         FROM users
         WHERE id = ?`,
                [userId]
            );

            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Get user's channels count
            const [channelCount] = await db.query(
                'SELECT COUNT(*) as count FROM channels WHERE user_id = ? AND is_active = TRUE',
                [userId]
            );

            const user = {
                ...users[0],
                channelCount: channelCount[0].count
            };

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();