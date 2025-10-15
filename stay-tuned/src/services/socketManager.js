// src/services/socketManager.js
import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { showMessage } from 'react-native-flash-message';

export const useSocketListeners = (navigation) => {
    const { socket, connected } = useSocket();

    useEffect(() => {
        if (!socket || !connected) return;

        // Listen for new posts
        socket.on('new_post', (data) => {
            // Handle new post
            // Could update feed, show notification, etc.
            showMessage({
                message: 'New Post',
                description: `New post in ${data.channel_name}`,
                type: 'info',
                duration: 3000,
            });
        });

        // Listen for user presence updates
        socket.on('user_presence', (data) => {
            // Update user status in UI if needed
        });

        // Listen for typing indicators
        socket.on('user_typing', (data) => {
            // Show typing indicator in channel
        });

        // Listen for notifications
        socket.on('notification', (data) => {
            showMessage({
                message: data.title,
                description: data.message,
                type: 'info',
                duration: 4000,
                onPress: () => {
                    // Navigate to relevant screen based on notification type
                    if (data.type === 'new_post' && data.channelId) {
                        navigation.navigate('ChannelDetails', { channelId: data.channelId });
                    }
                },
            });
        });

        return () => {
            socket.off('new_post');
            socket.off('user_presence');
            socket.off('user_typing');
            socket.off('notification');
        };
    }, [socket, connected, navigation]);
};