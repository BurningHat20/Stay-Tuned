// src/screens/notifications/NotificationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Avatar, Divider, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import EmptyState from '../../components/common/EmptyState';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Mock notification data (replace with actual API call in production)
const getMockNotifications = () => [
    {
        id: 1,
        type: 'new_post',
        title: 'New post in Tech Talks Daily',
        message: 'Check out the latest post about React Native!',
        channelId: 1,
        postId: 123,
        created_at: '2025-10-15T10:30:00.000Z',
        sender: {
            id: 1,
            username: 'johndoe',
            full_name: 'John Doe',
            avatar_url: null
        },
        read: false
    },
    {
        id: 2,
        type: 'new_subscriber',
        title: 'New subscriber',
        message: 'Sarah Johnson subscribed to your channel',
        channelId: 2,
        userId: 5,
        created_at: '2025-10-14T15:20:00.000Z',
        sender: {
            id: 5,
            username: 'sarahdev',
            full_name: 'Sarah Johnson',
            avatar_url: null
        },
        read: true
    },
    {
        id: 3,
        type: 'reaction',
        title: 'New reaction on your post',
        message: 'Mike liked your post about JavaScript',
        channelId: 1,
        postId: 120,
        created_at: '2025-10-13T09:15:00.000Z',
        sender: {
            id: 8,
            username: 'mikebrown',
            full_name: 'Mike Brown',
            avatar_url: null
        },
        read: true
    }
];

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            // In a real app, this would be an API call
            const response = getMockNotifications();
            setNotifications(response);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [fetchNotifications])
    );

    const handleRefresh = () => {
        fetchNotifications(true);
    };

    const markAsRead = (notificationId) => {
        // In a real app, this would call an API
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const handleNotificationPress = (notification) => {
        markAsRead(notification.id);

        if (notification.type === 'new_post' && notification.postId) {
            navigation.navigate('FeedTab', {
                screen: 'PostDetails',
                params: { postId: notification.postId }
            });
        } else if (notification.type === 'new_subscriber' && notification.userId) {
            navigation.navigate('ProfileTab', {
                screen: 'Profile',
                params: { userId: notification.userId }
            });
        } else if (notification.type === 'reaction' && notification.postId) {
            navigation.navigate('FeedTab', {
                screen: 'PostDetails',
                params: { postId: notification.postId }
            });
        }
    };

    const renderNotificationIcon = (type) => {
        switch (type) {
            case 'new_post':
                return 'file-document';
            case 'new_subscriber':
                return 'account-plus';
            case 'reaction':
                return 'heart';
            default:
                return 'bell';
        }
    };

    const renderNotification = ({ item }) => {
        return (
            <TouchableOpacity
                style={[styles.notificationItem, !item.read && styles.unreadNotification]}
                onPress={() => handleNotificationPress(item)}
            >
                <View style={styles.avatarContainer}>
                    {item.sender?.avatar_url ? (
                        <Avatar.Image
                            size={48}
                            source={{ uri: item.sender.avatar_url }}
                        />
                    ) : (
                        <Avatar.Icon
                            size={48}
                            icon={renderNotificationIcon(item.type)}
                            backgroundColor={theme.colors.primary}
                        />
                    )}
                </View>

                <View style={styles.notificationContent}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.timestamp}>{dayjs(item.created_at).fromNow()}</Text>
                </View>

                {!item.read && (
                    <View style={styles.unreadIndicator} />
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <Divider style={styles.divider} />}
                ListEmptyComponent={
                    <EmptyState
                        icon="bell-outline"
                        title="No notifications"
                        description="You don't have any notifications yet"
                    />
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
    },
    unreadNotification: {
        backgroundColor: `${theme.colors.primary}10`,
    },
    avatarContainer: {
        marginRight: theme.spacing.md,
    },
    notificationContent: {
        flex: 1,
    },
    title: {
        ...theme.typography.bodyLarge,
        fontWeight: '600',
        marginBottom: 2,
    },
    message: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text,
        marginBottom: 4,
    },
    timestamp: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    divider: {
        height: 1,
    },
    unreadIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        marginLeft: theme.spacing.sm,
        alignSelf: 'center',
    },
});

export default NotificationsScreen;