const channelService = require('../services/channel.service');
const logger = require('../utils/logger');

class ChannelController {
    async createChannel(req, res, next) {
        try {
            const channelData = {
                ...req.body,
                userId: req.user.id
            };

            const channel = await channelService.createChannel(channelData);

            logger.info(`Channel created: ${channel.channel_handle} by user ${req.user.id}`);

            res.status(201).json({
                message: 'Channel created successfully',
                channel
            });
        } catch (error) {
            next(error);
        }
    }

    async getChannel(req, res, next) {
        try {
            const { channelId } = req.params;
            const channel = await channelService.getChannelById(channelId, req.user?.id);

            res.json({ channel });
        } catch (error) {
            next(error);
        }
    }

    async getChannelByHandle(req, res, next) {
        try {
            const { handle } = req.params;
            const channel = await channelService.getChannelByHandle(handle, req.user?.id);

            res.json({ channel });
        } catch (error) {
            next(error);
        }
    }

    async updateChannel(req, res, next) {
        try {
            const { channelId } = req.params;
            const updates = req.body;

            const channel = await channelService.updateChannel(
                channelId,
                req.user.id,
                updates
            );

            res.json({
                message: 'Channel updated successfully',
                channel
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteChannel(req, res, next) {
        try {
            const { channelId } = req.params;
            await channelService.deleteChannel(channelId, req.user.id);

            res.json({ message: 'Channel deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getUserChannels(req, res, next) {
        try {
            const { userId } = req.params;
            const channels = await channelService.getUserChannels(userId);

            res.json({ channels });
        } catch (error) {
            next(error);
        }
    }

    async getMyChannels(req, res, next) {
        try {
            const channels = await channelService.getUserChannels(req.user.id);

            res.json({ channels });
        } catch (error) {
            next(error);
        }
    }

    async discoverChannels(req, res, next) {
        try {
            const { category, search, limit = 20, offset = 0 } = req.query;

            const channels = await channelService.discoverChannels({
                category,
                search,
                limit: parseInt(limit),
                offset: parseInt(offset),
                excludeUserId: req.user?.id
            });

            res.json({ channels });
        } catch (error) {
            next(error);
        }
    }

    async getTrendingChannels(req, res, next) {
        try {
            const { limit = 20 } = req.query;
            const channels = await channelService.getTrendingChannels(parseInt(limit));

            res.json({ channels });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChannelController();