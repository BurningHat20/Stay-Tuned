const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
    async register(req, res, next) {
        try {
            const { username, email, password, fullName } = req.body;

            const result = await authService.register({
                username,
                email,
                password,
                fullName
            });

            logger.info(`New user registered: ${username}`);

            res.status(201).json({
                message: 'Registration successful',
                user: result.user,
                token: result.token
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            logger.info(`User logged in: ${email}`);

            res.json({
                message: 'Login successful',
                user: result.user,
                token: result.token
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = await authService.getUserProfile(req.user.id);
            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const updates = req.body;
            const user = await authService.updateProfile(req.user.id, updates);

            res.json({
                message: 'Profile updated successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            await authService.updateUserStatus(req.user.id, status);

            res.json({
                message: 'Status updated successfully',
                status
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();