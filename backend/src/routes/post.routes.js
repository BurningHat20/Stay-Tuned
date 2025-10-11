const express = require('express');
const { body, param } = require('express-validator');
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { postLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
    '/',
    authenticateToken,
    postLimiter,
    [
        body('channelId').isInt().withMessage('Valid channel ID is required'),
        body('content').trim().notEmpty().isLength({ max: 500 }).withMessage('Content is required and max 500 characters'),
        body('postType').optional().isIn(['text', 'voice', 'image', 'location', 'status']),
        body('mediaUrl').optional().isURL()
    ],
    validate,
    postController.createPost
);

router.get('/feed', authenticateToken, postController.getFeed);
router.get('/channel/:channelId', postController.getChannelPosts);

router.post(
    '/:postId/react',
    authenticateToken,
    [
        body('reactionType').isIn(['heart', 'clap', 'fire', 'hundred'])
    ],
    validate,
    postController.reactToPost
);

router.delete('/:postId/react', authenticateToken, postController.removeReaction);
router.delete('/:postId', authenticateToken, postController.deletePost);

module.exports = router;