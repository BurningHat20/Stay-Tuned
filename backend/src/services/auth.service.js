const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { secret, expiresIn } = require('../config/jwt');

class AuthService {
    async register({ username, email, password, fullName }) {
        // Check if user exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            throw new Error('User already exists with this email or username');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.query(
            `INSERT INTO users (username, email, password_hash, full_name)
       VALUES (?, ?, ?, ?)`,
            [username, email, passwordHash, fullName || username]
        );

        const userId = result.insertId;

        // Generate token
        const token = jwt.sign({ userId, username, email }, secret, { expiresIn });

        // Get user data
        const [users] = await db.query(
            'SELECT id, username, email, full_name, avatar_url, account_type FROM users WHERE id = ?',
            [userId]
        );

        return {
            user: users[0],
            token
        };
    }

    async login(email, password) {
        // Get user with password
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new Error('Invalid email or password');
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        // Update last seen
        await db.query(
            'UPDATE users SET last_seen = NOW(), status = ? WHERE id = ?',
            ['online', user.id]
        );

        // Generate token
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            secret,
            { expiresIn }
        );

        // Remove password from response
        delete user.password_hash;

        return { user, token };
    }

    async getUserProfile(userId) {
        const [users] = await db.query(
            `SELECT id, username, email, full_name, bio, avatar_url, 
              is_verified, account_type, status, created_at
       FROM users WHERE id = ?`,
            [userId]
        );

        if (users.length === 0) {
            throw new Error('User not found');
        }

        return users[0];
    }

    async updateProfile(userId, updates) {
        const allowedFields = ['full_name', 'bio', 'avatar_url'];
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

        values.push(userId);

        await db.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            values
        );

        return this.getUserProfile(userId);
    }

    async updateUserStatus(userId, status) {
        const validStatuses = ['online', 'away', 'busy', 'offline'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        await db.query(
            'UPDATE users SET status = ?, last_seen = NOW() WHERE id = ?',
            [status, userId]
        );
    }
}

module.exports = new AuthService();