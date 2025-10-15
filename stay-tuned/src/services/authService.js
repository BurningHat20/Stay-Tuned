// src/services/authService.js
import apiClient from './apiClient';

const authService = {
    login: async (email, password) => {
        return apiClient.post('/auth/login', { email, password });
    },

    register: async (userData) => {
        return apiClient.post('/auth/register', userData);
    },

    getProfile: async () => {
        return apiClient.get('/auth/profile');
    },

    updateProfile: async (profileData) => {
        return apiClient.patch('/auth/profile', profileData);
    },

    updateStatus: async (status) => {
        return apiClient.patch('/auth/status', { status });
    }
};

export default authService;