module.exports = {
    CHANNEL_TYPES: ['personal', 'professional', 'interest', 'event', 'business'],
    POST_TYPES: ['text', 'voice', 'image', 'location', 'status'],
    REACTION_TYPES: ['heart', 'clap', 'fire', 'hundred'],
    NOTIFICATION_LEVELS: ['all', 'important', 'none'],
    ACCOUNT_TYPES: ['free', 'plus', 'business'],
    USER_STATUS: ['online', 'away', 'busy', 'offline'],

    LIMITS: {
        FREE_CHANNELS: 3,
        PLUS_CHANNELS: 20,
        BUSINESS_CHANNELS: 100,
        POST_CONTENT_MAX_LENGTH: 500,
        CHANNEL_NAME_MAX_LENGTH: 100,
        BIO_MAX_LENGTH: 500
    },

    SOCKET_EVENTS: {
        // Client to Server
        JOIN_CHANNEL: 'join_channel',
        LEAVE_CHANNEL: 'leave_channel',
        USER_TYPING: 'user_typing',
        UPDATE_STATUS: 'update_status',

        // Server to Client
        NEW_POST: 'new_post',
        CHANNEL_UPDATE: 'channel_update',
        USER_PRESENCE: 'user_presence',
        NOTIFICATION: 'notification',
        ERROR: 'error'
    }
};