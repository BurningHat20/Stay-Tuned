// src/services/channelService.js
import apiClient from './apiClient';

const channelService = {
    createChannel: async (channelData) => {
        return apiClient.post('/channels', channelData);
    },

    getChannelById: async (channelId) => {
        return apiClient.get(`/channels/${channelId}`);
    },

    getChannelByHandle: async (handle) => {
        return apiClient.get(`/channels/handle/${handle}`);
    },

    discoverChannels: async (params) => {
        return apiClient.get('/channels/discover', { params });
    },

    getTrendingChannels: async (limit = 20) => {
        return apiClient.get('/channels/trending', { params: { limit } });
    },

    getMyChannels: async () => {
        return apiClient.get('/channels/my-channels');
    },

    getUserChannels: async (userId) => {
        return apiClient.get(`/channels/user/${userId}`);
    },

    updateChannel: async (channelId, channelData) => {
        return apiClient.patch(`/channels/${channelId}`, channelData);
    },

    deleteChannel: async (channelId) => {
        return apiClient.delete(`/channels/${channelId}`);
    }
};

export default channelService;