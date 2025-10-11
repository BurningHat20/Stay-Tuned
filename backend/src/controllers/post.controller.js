const postService = require('../services/post.service');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

class PostController {
    async createPost(req, res, next) {
        try {
            const { channelId, content, postType, mediaUrl } = req.body;

            const post = await postService.createPost({
                channelId,
                userId: req.user.id,
                content,
                postType,
                mediaUrl
            });

            // Send real-time notification to subscribers
            await notificationService.notifyChannelSubscribers(channelId, post);

            logger.info(`Post created in channel ${channelId} by user ${req.user.id}`);

            res.status(201).json({
                message: 'Post created successfully',
                post
            });
        } catch (error) {
            next(error);
        }
    }

    async getChannelPosts(req, res, next) {
        try {
            const { channelId } = req.params;
            const { limit = 20, offset = 0 } = req.query;

            const posts = await postService.getChannelPosts(
                channelId,
                parseInt(limit),
                parseInt(offset)
            );

            res.json({ posts });
        } catch (error) {
            next(error);
        }
    }

    async getFeed(req, res, next) {
        try {
            const { limit = 20, offset = 0 } = req.query;

            const posts = await postService.getUserFeed(
                req.user.id,
                parseInt(limit),
                parseInt(offset)
            );

            res.json({ posts });
        } catch (error) {
            next(error);
        }
    }

    async reactToPost(req, res, next) {
        try {
            const { postId } = req.params;
            const { reactionType } = req.body;

            await postService.reactToPost(postId, req.user.id, reactionType);

            res.json({ message: 'Reaction added successfully' });
        } catch (error) {
            next(error);
        }
    }

    async removeReaction(req, res, next) {
        try {
            const { postId } = req.params;

            await postService.removeReaction(postId, req.user.id);

            res.json({ message: 'Reaction removed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async deletePost(req, res, next) {
        try {
            const { postId } = req.params;

            await postService.deletePost(postId, req.user.id);

            res.json({ message: 'Post deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PostController();