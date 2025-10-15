// src/screens/feed/PostDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Avatar, Divider, IconButton } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import postService from '../../services/postService';
import { theme } from '../../theme/theme';
import ReactionButton from '../../components/feed/ReactionButton';
import { useSocket } from '../../contexts/SocketContext';

dayjs.extend(relativeTime);

const PostDetailScreen = ({ navigation }) => {
    const route = useRoute();
    const { postId } = route.params;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { joinChannel, leaveChannel } = useSocket();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Simplified - in a real app you would have an API endpoint to get post details
                const response = await postService.getFeed();
                const foundPost = response.posts.find(p => p.id === postId);
                if (foundPost) {
                    setPost(foundPost);

                    // Update navigation header
                    navigation.setOptions({
                        title: 'Post'
                    });

                    // Join channel for real-time updates
                    joinChannel(foundPost.channel_id);
                }
            } catch (error) {
                console.error('Error fetching post:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();

        return () => {
            // Clean up
            if (post?.channel_id) {
                leaveChannel(post.channel_id);
            }
        };
    }, [postId]);

    const handleReaction = async (reactionType) => {
        try {
            const hadReaction = !!post.user_reaction;

            // Optimistic update
            setPost(prev => ({
                ...prev,
                reaction_count: hadReaction ? prev.reaction_count : prev.reaction_count + 1,
                user_reaction: hadReaction ? null : reactionType
            }));

            // Call API
            if (hadReaction) {
                await postService.removeReaction(postId);
            } else {
                await postService.addReaction(postId, reactionType);
            }
        } catch (error) {
            console.error('Error handling reaction:', error);

            // Revert on error
            // Here you would normally refetch the post
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Post not found</Text>
                <IconButton
                    icon="refresh"
                    size={24}
                    onPress={() => navigation.goBack()}
                    style={styles.refreshButton}
                />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => navigation.navigate('UserProfile', { userId: post.user_id })}
                >
                    <Avatar.Image
                        size={50}
                        source={
                            post.avatar_url
                                ? { uri: post.avatar_url }
                                : require('../../../assets/images/default-avatar.png')
                        }
                    />
                    <View style={styles.nameContainer}>
                        <Text style={styles.fullName}>{post.full_name}</Text>
                        <Text style={styles.username}>@{post.username}</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('ChannelDetails', { channelId: post.channel_id })}>
                    <View style={styles.channelContainer}>
                        <Text style={styles.channelName}>{post.channel_name}</Text>
                        <Text style={styles.channelHandle}>@{post.channel_handle}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.postText}>{post.content}</Text>

                {post.media_url && post.post_type === 'image' && (
                    <Image
                        source={{ uri: post.media_url }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                    />
                )}

                <Text style={styles.timestamp}>{dayjs(post.created_at).format('MMMM D, YYYY [at] h:mm A')}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.reactionSection}>
                <Text style={styles.reactionLabel}>
                    {post.reaction_count} {post.reaction_count === 1 ? 'reaction' : 'reactions'}
                </Text>

                <View style={styles.reactionButtons}>
                    <ReactionButton
                        reaction={post.user_reaction}
                        onReact={handleReaction}
                        size="large"
                    />
                </View>
            </View>
        </ScrollView>
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
    },
    errorText: {
        ...theme.typography.titleMedium,
        color: theme.colors.error,
        marginBottom: theme.spacing.md,
    },
    refreshButton: {
        backgroundColor: theme.colors.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameContainer: {
        marginLeft: theme.spacing.md,
    },
    fullName: {
        ...theme.typography.titleSmall,
    },
    username: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    channelContainer: {
        alignItems: 'flex-end',
    },
    channelName: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    channelHandle: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    content: {
        padding: theme.spacing.md,
    },
    postText: {
        ...theme.typography.bodyLarge,
        marginBottom: theme.spacing.lg,
        lineHeight: 24,
    },
    mediaImage: {
        width: '100%',
        height: 300,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.md,
    },
    timestamp: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginTop: theme.spacing.sm,
    },
    divider: {
        marginVertical: theme.spacing.sm,
    },
    reactionSection: {
        padding: theme.spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reactionLabel: {
        ...theme.typography.bodyMedium,
        color: theme.colors.placeholder,
    },
    reactionButtons: {
        flexDirection: 'row',
    },
});

export default PostDetailScreen;