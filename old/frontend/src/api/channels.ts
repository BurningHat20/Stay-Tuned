import { apiClient } from "./client";

export interface CreateChannelData {
  channelName: string;
  channelHandle: string;
  description?: string;
  channelType?: string;
  category?: string;
  isPrivate?: boolean;
}

export const channelsApi = {
  create(data: CreateChannelData) {
    return apiClient.post("/channels", data);
  },

  getById(channelId: number) {
    return apiClient.get(`/channels/${channelId}`);
  },

  getByHandle(handle: string) {
    return apiClient.get(`/channels/handle/${handle}`);
  },

  discover(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/channels/discover?${query}`);
  },

  getTrending(limit = 20) {
    return apiClient.get(`/channels/trending?limit=${limit}`);
  },

  getMyChannels() {
    return apiClient.get("/channels/my-channels");
  },

  getUserChannels(userId: number) {
    return apiClient.get(`/channels/user/${userId}`);
  },

  update(channelId: number, data: Partial<CreateChannelData>) {
    return apiClient.patch(`/channels/${channelId}`, data);
  },

  delete(channelId: number) {
    return apiClient.delete(`/channels/${channelId}`);
  },
};
