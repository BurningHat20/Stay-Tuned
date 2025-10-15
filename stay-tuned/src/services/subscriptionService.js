// src/services/subscriptionService.js
import apiClient from './apiClient';

const subscriptionService = {
    subscribeToChannel: async (channelId, notificationLevel = 'all') => {
        return apiClient.post(`/subscriptions/${channelId}`, { notificationLevel });
    },

    unsubscribeFromChannel: async (channelId) => {
        return apiClient.delete(`/subscriptions/${channelId}`);
    },

    getUserSubscriptions: async () => {
        return apiClient.get('/subscriptions');
    },

    getChannelSubscribers: async (channelId, params) => {
        return apiClient.get(`/subscriptions/${channelId}/subscribers`, { params });
    },

    updateNotificationLevel: async (channelId, notificationLevel) => {
        return apiClient.patch(`/subscriptions/${channelId}/notifications`, { notificationLevel });
    }
};

export default subscriptionService;