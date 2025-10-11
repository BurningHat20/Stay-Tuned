const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validateUsername = (username) => {
    const re = /^[a-zA-Z0-9_]{3,50}$/;
    return re.test(username);
};

const validateChannelHandle = (handle) => {
    const re = /^[a-zA-Z0-9_-]{3,50}$/;
    return re.test(handle);
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/<[^>]*>/g, '');
};

module.exports = {
    validateEmail,
    validateUsername,
    validateChannelHandle,
    sanitizeInput
};