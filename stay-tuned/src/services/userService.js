// src/services/userService.js
import apiClient from './apiClient';

const userService = {
    searchUsers: async (query, limit = 20) => {
        return apiClient.get('/users/search', { params: { q: query, limit } });
    },

    getUserDetails: async (userId) => {
        return apiClient.get(`/users/${userId}`);
    }
};

export default userService;