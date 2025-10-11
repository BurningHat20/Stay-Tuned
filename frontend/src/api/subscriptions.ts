import { apiClient } from "./client";

export const subscriptionsApi = {
  subscribe(channelId: number, notificationLevel = "all") {
    return apiClient.post(`/subscriptions/${channelId}`, { notificationLevel });
  },

  unsubscribe(channelId: number) {
    return apiClient.delete(`/subscriptions/${channelId}`);
  },

  getMySubscriptions() {
    return apiClient.get("/subscriptions");
  },

  getChannelSubscribers(channelId: number, limit = 50, offset = 0) {
    return apiClient.get(
      `/subscriptions/${channelId}/subscribers?limit=${limit}&offset=${offset}`
    );
  },

  updateNotificationLevel(channelId: number, notificationLevel: string) {
    return apiClient.patch(`/subscriptions/${channelId}/notifications`, {
      notificationLevel,
    });
  },
};
