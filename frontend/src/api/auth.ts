import { apiClient } from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: any;
  token: string;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    await AsyncStorage.setItem("auth_token", response.token);
    return response;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    await AsyncStorage.setItem("auth_token", response.token);
    return response;
  },

  async getProfile() {
    return apiClient.get<{ user: any }>("/auth/profile");
  },

  async updateProfile(data: any) {
    return apiClient.patch<{ user: any }>("/auth/profile", data);
  },

  async logout() {
    await AsyncStorage.removeItem("auth_token");
  },
};
