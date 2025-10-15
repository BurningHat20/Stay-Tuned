// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStoredToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                    const userData = await authService.getProfile(storedToken);
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to load token:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredToken();
    }, []);

    const login = async (email, password) => {
        try {
            const { token, user } = await authService.login(email, password);
            await AsyncStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const { token, user } = await authService.register(userData);
            await AsyncStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            return user;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const updateUserProfile = (updatedProfile) => {
        setUser({ ...user, ...updatedProfile });
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);