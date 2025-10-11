const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const db = require('../config/database');
const { SOCKET_EVENTS } = require('../config/constants');
const logger = require('../utils/logger');

let io;

const initializeWebSocket = (socketIO) => {
    io = socketIO;

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, secret);
            socket.userId = decoded.userId;
            socket.username = decoded.username;

            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.userId;
        logger.info(`User connected: ${socket.username} (${userId})`);

        // Join user's personal room
        socket.join(`user_${userId}`);

        // Store session
        await db.query(
            'INSERT INTO user_sessions (user_id, socket_id) VALUES (?, ?)',
            [userId, socket.id]
        );

        // Update user status to online
        await db.query(
            'UPDATE users SET status = ?, last_seen = NOW() WHERE id = ?',
            ['online', userId]
        );

        // Broadcast user presence
        socket.broadcast.emit(SOCKET_EVENTS.USER_PRESENCE, {
            userId,
            status: 'online'
        });

        // Join subscribed channels
        const [subscriptions] = await db.query(
            'SELECT channel_id FROM subscriptions WHERE user_id = ?',
            [userId]
        );

        subscriptions.forEach(sub => {
            socket.join(`channel_${sub.channel_id}`);
        });

        // Handle join channel
        socket.on(SOCKET_EVENTS.JOIN_CHANNEL, async (channelId) => {
            try {
                // Verify subscription
                const [subs] = await db.query(
                    'SELECT id FROM subscriptions WHERE user_id = ? AND channel_id = ?',
                    [userId, channelId]
                );

                if (subs.length > 0) {
                    socket.join(`channel_${channelId}`);
                    logger.info(`User ${userId} joined channel ${channelId}`);
                }
            } catch (error) {
                socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
            }
        });

        // Handle leave channel
        socket.on(SOCKET_EVENTS.LEAVE_CHANNEL, (channelId) => {
            socket.leave(`channel_${channelId}`);
            logger.info(`User ${userId} left channel ${channelId}`);
        });

        // Handle typing indicator
        socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
            socket.to(`channel_${data.channelId}`).emit(SOCKET_EVENTS.USER_TYPING, {
                userId,
                username: socket.username,
                channelId: data.channelId
            });
        });

        // Handle status update
        socket.on(SOCKET_EVENTS.UPDATE_STATUS, async (status) => {
            try {
                await db.query(
                    'UPDATE users SET status = ? WHERE id = ?',
                    [status, userId]
                );

                socket.broadcast.emit(SOCKET_EVENTS.USER_PRESENCE, {
                    userId,
                    status
                });
            } catch (error) {
                socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            logger.info(`User disconnected: ${socket.username} (${userId})`);

            // Remove session
            await db.query(
                'DELETE FROM user_sessions WHERE socket_id = ?',
                [socket.id]
            );

            // Check if user has other active sessions
            const [sessions] = await db.query(
                'SELECT id FROM user_sessions WHERE user_id = ?',
                [userId]
            );

            if (sessions.length === 0) {
                // No other sessions, set to offline
                await db.query(
                    'UPDATE users SET status = ?, last_seen = NOW() WHERE id = ?',
                    ['offline', userId]
                );

                socket.broadcast.emit(SOCKET_EVENTS.USER_PRESENCE, {
                    userId,
                    status: 'offline'
                });
            }
        });
    });

    logger.info('✅ WebSocket initialized');
};

const getIO = () => {
    if (!io) {
        throw new Error('WebSocket not initialized');
    }
    return io;
};

module.exports = { initializeWebSocket, getIO };