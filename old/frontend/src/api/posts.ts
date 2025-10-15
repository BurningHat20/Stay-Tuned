import { apiClient } from "./client";

export interface CreatePostData {
  channelId: number;
  content: string;
  postType?: "text" | "voice" | "image" | "location" | "status";
  mediaUrl?: string;
}

export const postsApi = {
  create(data: CreatePostData) {
    return apiClient.post("/posts", data);
  },

  getFeed(limit = 20, offset = 0) {
    return apiClient.get(`/posts/feed?limit=${limit}&offset=${offset}`);
  },

  getChannelPosts(channelId: number, limit = 20, offset = 0) {
    return apiClient.get(
      `/posts/channel/${channelId}?limit=${limit}&offset=${offset}`
    );
  },

  react(postId: number, reactionType: string) {
    return apiClient.post(`/posts/${postId}/react`, { reactionType });
  },

  removeReaction(postId: number) {
    return apiClient.delete(`/posts/${postId}/react`);
  },

  delete(postId: number) {
    return apiClient.delete(`/posts/${postId}`);
  },
};
