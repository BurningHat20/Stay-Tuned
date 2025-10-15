import { apiClient } from "./client";

export const usersApi = {
  search(query: string, limit = 20) {
    return apiClient.get(
      `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
  },

  getById(userId: number) {
    return apiClient.get(`/users/${userId}`);
  },
};
