const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later'
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
});

const postLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 posts per minute
    message: 'Too many posts, please slow down'
});

module.exports = { authLimiter, apiLimiter, postLimiter };