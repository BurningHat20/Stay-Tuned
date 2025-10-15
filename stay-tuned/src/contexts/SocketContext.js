// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { WEBSOCKET_URL } from '@env';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { token, user } = useAuth();

    useEffect(() => {
        let socketInstance;

        if (token && user) {
            // Initialize socket
            socketInstance = io(WEBSOCKET_URL, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            // Socket events
            socketInstance.on('connect', () => {
                console.log('Socket connected');
                setConnected(true);
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
                setConnected(false);
            });

            socketInstance.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(socketInstance);
        }

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, [token, user]);

    const joinChannel = (channelId) => {
        if (socket && connected) {
            socket.emit('join_channel', channelId);
        }
    };

    const leaveChannel = (channelId) => {
        if (socket && connected) {
            socket.emit('leave_channel', channelId);
        }
    };

    const updateStatus = (status) => {
        if (socket && connected) {
            socket.emit('update_status', status);
        }
    };

    const sendTyping = (channelId) => {
        if (socket && connected) {
            socket.emit('user_typing', { channelId });
        }
    };

    const value = {
        socket,
        connected,
        joinChannel,
        leaveChannel,
        updateStatus,
        sendTyping,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);