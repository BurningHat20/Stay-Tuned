// src/screens/channel/MyChannelsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import channelService from '../../services/channelService';
import EmptyState from '../../components/common/EmptyState';
import { theme } from '../../theme/theme';

const MyChannelsScreen = ({ navigation }) => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChannels = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await channelService.getMyChannels();
            setChannels(response.channels || []);
        } catch (error) {
            console.error('Error fetching channels:', error);
            showMessage({
                message: 'Failed to load channels',
                type: 'danger',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchChannels();
        }, [fetchChannels])
    );

    const handleRefresh = () => {
        fetchChannels(true);
    };

    const handleDeleteChannel = async (channelId) => {
        Alert.alert(
            'Delete Channel',
            'Are you sure you want to delete this channel? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await channelService.deleteChannel(channelId);

                            // Update state after successful deletion
                            setChannels(channels.filter(c => c.id !== channelId));

                            showMessage({
                                message: 'Channel deleted successfully',
                                type: 'success',
                            });
                        } catch (error) {
                            console.error('Error deleting channel:', error);
                            showMessage({
                                message: 'Failed to delete channel',
                                description: error.error || 'Please try again',
                                type: 'danger',
                            });
                        }
                    },
                },
            ]
        );
    };

    const renderChannel = ({ item }) => (
        <Card style={styles.channelCard}>
            <Card.Content>
                <View style={styles.channelCardHeader}>
                    <View style={styles.channelInfo}>
                        <Text style={styles.channelName}>{item.channel_name}</Text>
                        <Text style={styles.channelHandle}>@{item.channel_handle}</Text>
                    </View>

                    <View style={styles.channelActions}>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => navigation.navigate('EditChannel', { channelId: item.id })}
                        />

                        <IconButton
                            icon="delete"
                            size={20}
                            onPress={() => handleDeleteChannel(item.id)}
                            iconColor={theme.colors.error}
                        />
                    </View>
                </View>

                {item.description && (
                    <Text style={styles.channelDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                <View style={styles.channelStats}>
                    <Text style={styles.channelStat}>
                        {item.subscriber_count} subscriber{item.subscriber_count !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.channelStatDot}>•</Text>
                    <Text style={styles.channelStat}>
                        {item.post_count} post{item.post_count !== 1 ? 's' : ''}
                    </Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.cardActions}>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('ChannelDetails', { channelId: item.id })}
                        icon="eye"
                    >
                        View
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('CreatePostTab')}
                        icon="plus"
                    >
                        New Post
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={channels}
                renderItem={renderChannel}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <EmptyState
                        icon="television"
                        title="No channels yet"
                        description="Create your first channel to start broadcasting content."
                        buttonText="Create Channel"
                        onButtonPress={() => navigation.navigate('CreateChannel')}
                    />
                }
                ListFooterComponent={
                    channels.length > 0 ? (
                        <Button
                            mode="contained"
                            icon="plus"
                            onPress={() => navigation.navigate('CreateChannel')}
                            style={styles.createButton}
                        >
                            Create Channel
                        </Button>
                    ) : null
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: theme.spacing.md,
        flexGrow: 1,
    },
    channelCard: {
        marginBottom: theme.spacing.md,
    },
    channelCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    channelInfo: {
        flex: 1,
    },
    channelName: {
        ...theme.typography.titleSmall,
    },
    channelHandle: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    channelActions: {
        flexDirection: 'row',
    },
    channelDescription: {
        ...theme.typography.bodyMedium,
        marginBottom: theme.spacing.sm,
    },
    channelStats: {
        flexDirection: 'row',
        marginBottom: theme.spacing.sm,
    },
    channelStat: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    channelStatDot: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginHorizontal: 4,
    },
    divider: {
        marginVertical: theme.spacing.sm,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 4,
    },
    createButton: {
        margin: theme.spacing.md,
    },
});

export default MyChannelsScreen;