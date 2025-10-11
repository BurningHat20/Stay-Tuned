const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message}`, {
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Resource already exists' });
    }

    res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;