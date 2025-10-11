const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, secret);

        // Verify user still exists
        const [users] = await db.query(
            'SELECT id, username, email, account_type, status FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, secret);
            const [users] = await db.query(
                'SELECT id, username, email, account_type FROM users WHERE id = ?',
                [decoded.userId]
            );
            if (users.length > 0) {
                req.user = users[0];
            }
        }
        next();
    } catch (error) {
        next();
    }
};

module.exports = { authenticateToken, optionalAuth };