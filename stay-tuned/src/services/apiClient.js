// src/services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle token expiration
        if (error.response && error.response.status === 401) {
            // Could dispatch logout action or redirect to login
            AsyncStorage.removeItem('token');
        }

        return Promise.reject(
            error.response ? error.response.data : { error: 'Network error' }
        );
    }
);

export default apiClient;