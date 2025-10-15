// src/screens/channel/ChannelDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Button, Avatar, Chip, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import channelService from '../../services/channelService';
import postService from '../../services/postService';
import subscriptionService from '../../services/subscriptionService';
import Post from '../../components/feed/Post';
import EmptyState from '../../components/common/EmptyState';
import { theme } from '../../theme/theme';
import { showMessage } from 'react-native-flash-message';

const ChannelDetailScreen = ({ navigation }) => {
    const route = useRoute();
    const { channelId } = route.params;
    const { user } = useAuth();
    const { joinChannel, leaveChannel } = useSocket();

    const [channel, setChannel] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [subscribing, setSubscribing] = useState(false);
    const [showDescription, setShowDescription] = useState(false);

    const isOwner = user && channel?.user_id === user.id;

    const fetchChannel = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await channelService.getChannelById(channelId);
            setChannel(response.channel);

            // Update navigation header
            if (response.channel?.channel_name) {
                navigation.setOptions({
                    title: response.channel.channel_name
                });
            }
        } catch (error) {
            console.error('Error fetching channel:', error);
            showMessage({
                message: 'Failed to load channel',
                type: 'danger',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchPosts = async () => {
        setPostsLoading(true);
        try {
            const response = await postService.getChannelPosts(channelId);
            setPosts(response.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setPostsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChannel();
            fetchPosts();

            // Join channel room for real-time updates
            joinChannel(channelId);

            return () => {
                // Leave channel room when screen is unfocused
                leaveChannel(channelId);
            };
        }, [channelId])
    );

    const handleRefresh = () => {
        fetchChannel(true);
        fetchPosts();
    };

    const handleSubscribe = async () => {
        if (!user) {
            // Redirect to login if not authenticated
            navigation.navigate('Auth', { screen: 'Login' });
            return;
        }

        setSubscribing(true);
        try {
            await subscriptionService.subscribeToChannel(channelId);

            // Update local state
            setChannel(prev => ({
                ...prev,
                is_subscribed: true,
                subscriber_count: prev.subscriber_count + 1
            }));

            showMessage({
                message: 'Subscribed successfully',
                type: 'success',
            });
        } catch (error) {
            console.error('Failed to subscribe:', error);
            showMessage({
                message: 'Failed to subscribe',
                description: error.error || 'Please try again',
                type: 'danger',
            });
        } finally {
            setSubscribing(false);
        }
    };

    const handleUnsubscribe = async () => {
        setSubscribing(true);
        try {
            await subscriptionService.unsubscribeFromChannel(channelId);

            // Update local state
            setChannel(prev => ({
                ...prev,
                is_subscribed: false,
                subscriber_count: Math.max(0, prev.subscriber_count - 1)
            }));

            showMessage({
                message: 'Unsubscribed successfully',
                type: 'info',
            });
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            showMessage({
                message: 'Failed to unsubscribe',
                description: error.error || 'Please try again',
                type: 'danger',
            });
        } finally {
            setSubscribing(false);
        }
    };

    const handleReaction = async (postId, reactionType, hadReaction, prevReaction) => {
        try {
            // Optimistically update UI
            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    const newReactionCount = post.reaction_count + (hadReaction ? 0 : 1);
                    return {
                        ...post,
                        reaction_count: newReactionCount,
                        user_reaction: hadReaction ? null : reactionType
                    };
                }
                return post;
            });

            setPosts(updatedPosts);

            // Call API
            if (hadReaction) {
                await postService.removeReaction(postId);
            } else {
                await postService.addReaction(postId, reactionType);
            }
        } catch (error) {
            console.error('Error handling reaction:', error);
            // Revert on error
            fetchPosts();
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!channel) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Channel not found</Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.goBack()}
                    style={styles.errorButton}
                >
                    Go Back
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* Cover Image */}
                <View style={styles.coverContainer}>
                    <Image
                        source={
                            channel.cover_image_url
                                ? { uri: channel.cover_image_url }
                                : require('../../../assets/images/default-cover.jpg')
                        }
                        style={styles.coverImage}
                    />

                    <View style={styles.channelHeaderContainer}>
                        <Avatar.Image
                            size={80}
                            source={
                                channel.avatar_url
                                    ? { uri: channel.avatar_url }
                                    : require('../../../assets/images/default-avatar.png')
                            }
                            style={styles.avatar}
                        />

                        <View style={styles.channelNameRow}>
                            <Text style={styles.channelName}>{channel.channel_name}</Text>
                            {channel.is_verified && (
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedText}>✓</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.channelHandle}>@{channel.channel_handle}</Text>

                        <TouchableOpacity
                            style={styles.creatorRow}
                            onPress={() => navigation.navigate('UserProfile', { userId: channel.user_id })}
                        >
                            <Text style={styles.creatorLabel}>By </Text>
                            <Text style={styles.creatorName}>{channel.full_name}</Text>
                            <Text style={styles.creatorUsername}>@{channel.username}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Channel Info */}
                <View style={styles.infoContainer}>
                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{channel.subscriber_count}</Text>
                            <Text style={styles.statLabel}>Subscribers</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{channel.post_count}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {channel.description && (
                        <View style={styles.descriptionContainer}>
                            <Text
                                style={styles.description}
                                numberOfLines={showDescription ? undefined : 2}
                            >
                                {channel.description}
                            </Text>
                            {channel.description.length > 100 && (
                                <TouchableOpacity
                                    onPress={() => setShowDescription(!showDescription)}
                                    style={styles.readMoreButton}
                                >
                                    <Text style={styles.readMoreText}>
                                        {showDescription ? 'Show less' : 'Read more'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Tags/Metadata */}
                    <View style={styles.metadataContainer}>
                        {channel.channel_type && (
                            <Chip style={styles.metadataChip} mode="outlined">
                                {channel.channel_type}
                            </Chip>
                        )}

                        {channel.category && (
                            <Chip style={styles.metadataChip} mode="outlined">
                                {channel.category}
                            </Chip>
                        )}
                    </View>

                    {/* Subscribe Button */}
                    {!isOwner ? (
                        <Button
                            mode={channel.is_subscribed ? 'outlined' : 'contained'}
                            icon={channel.is_subscribed ? 'check' : 'plus'}
                            onPress={channel.is_subscribed ? handleUnsubscribe : handleSubscribe}
                            loading={subscribing}
                            disabled={subscribing}
                            style={styles.subscribeButton}
                        >
                            {channel.is_subscribed ? 'Subscribed' : 'Subscribe'}
                        </Button>
                    ) : (
                        <Button
                            mode="contained"
                            icon="pencil"
                            onPress={() => navigation.navigate('EditChannel', { channelId: channel.id })}
                            style={styles.editButton}
                        >
                            Edit Channel
                        </Button>
                    )}
                </View>

                <Divider style={styles.divider} />

                {/* Posts */}
                <View style={styles.postsContainer}>
                    <View style={styles.postsHeader}>
                        <Text style={styles.postsTitle}>Posts</Text>
                        {isOwner && (
                            <Button
                                mode="contained"
                                icon="plus"
                                onPress={() => navigation.navigate('CreatePostTab')}
                            >
                                New Post
                            </Button>
                        )}
                    </View>

                    {postsLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.postsLoader} />
                    ) : posts.length > 0 ? (
                        posts.map(post => (
                            <Post
                                key={post.id}
                                post={post}
                                onReaction={handleReaction}
                                onPress={() => navigation.navigate('PostDetails', { postId: post.id })}
                                onChannelPress={() => { }} // Already in channel screen
                                onUserPress={() => navigation.navigate('UserProfile', { userId: post.user_id })}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="post"
                            title="No posts yet"
                            description={isOwner ? 'Create your first post to get started!' : 'Check back later for new content.'}
                            buttonText={isOwner ? 'Create Post' : undefined}
                            onButtonPress={isOwner ? () => navigation.navigate('CreatePostTab') : undefined}
                        />
                    )}
                </View>
            </ScrollView>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    errorText: {
        ...theme.typography.titleMedium,
        color: theme.colors.error,
        marginBottom: theme.spacing.md,
    },
    errorButton: {
        marginTop: theme.spacing.md,
    },
    coverContainer: {
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: 150,
    },
    channelHeaderContainer: {
        alignItems: 'center',
        marginTop: -40, // Pull up over the cover image
        paddingBottom: theme.spacing.md,
    },
    avatar: {
        backgroundColor: theme.colors.surface,
        borderWidth: 3,
        borderColor: '#fff',
    },
    channelNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    channelName: {
        ...theme.typography.titleMedium,
        marginRight: theme.spacing.xs,
    },
    verifiedBadge: {
        backgroundColor: theme.colors.primary,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    channelHandle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.placeholder,
        marginTop: 2,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
    },
    creatorLabel: {
        ...theme.typography.bodySmall,
        color: theme.colors.text,
    },
    creatorName: {
        ...theme.typography.bodySmall,
        fontWeight: '600',
    },
    creatorUsername: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginLeft: 4,
    },
    infoContainer: {
        padding: theme.spacing.md,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    statDivider: {
        width: 1,
        height: '80%',
        backgroundColor: theme.colors.border,
        alignSelf: 'center',
    },
    statValue: {
        ...theme.typography.titleMedium,
    },
    statLabel: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    descriptionContainer: {
        marginBottom: theme.spacing.md,
    },
    description: {
        ...theme.typography.bodyMedium,
    },
    readMoreButton: {
        marginTop: 4,
    },
    readMoreText: {
        ...theme.typography.bodySmall,
        color: theme.colors.primary,
    },
    metadataContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.md,
    },
    metadataChip: {
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    subscribeButton: {
        marginVertical: theme.spacing.sm,
    },
    editButton: {
        marginVertical: theme.spacing.sm,
    },
    divider: {
        marginVertical: theme.spacing.sm,
    },
    postsContainer: {
        padding: theme.spacing.md,
    },
    postsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    postsTitle: {
        ...theme.typography.titleSmall,
    },
    postsLoader: {
        marginVertical: theme.spacing.lg,
    },
});

export default ChannelDetailScreen;