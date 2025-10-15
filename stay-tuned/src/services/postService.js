// src/services/postService.js
import apiClient from './apiClient';

const postService = {
    createPost: async (postData) => {
        return apiClient.post('/posts', postData);
    },

    getFeed: async (params) => {
        return apiClient.get('/posts/feed', { params });
    },

    getChannelPosts: async (channelId, params) => {
        return apiClient.get(`/posts/channel/${channelId}`, { params });
    },

    addReaction: async (postId, reactionType) => {
        return apiClient.post(`/posts/${postId}/react`, { reactionType });
    },

    removeReaction: async (postId) => {
        return apiClient.delete(`/posts/${postId}/react`);
    },

    deletePost: async (postId) => {
        return apiClient.delete(`/posts/${postId}`);
    }
};

export default postService;