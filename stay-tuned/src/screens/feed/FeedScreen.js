// src/screens/feed/FeedScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import Post from '../../components/feed/Post';
import EmptyState from '../../components/common/EmptyState';
import { theme } from '../../theme/theme';
import postService from '../../services/postService';
import { useSocket } from '../../contexts/SocketContext';
import { useFocusEffect } from '@react-navigation/native';

const FeedScreen = ({ navigation }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const limit = 20;

    const { socket, connected } = useSocket();

    const loadFeed = async (isRefreshing = false) => {
        try {
            if (isRefreshing) {
                setRefreshing(true);
                setOffset(0);
            } else if (!isRefreshing && !loading) {
                setLoadingMore(true);
            }

            const currentOffset = isRefreshing ? 0 : offset;
            const response = await postService.getFeed({
                limit,
                offset: currentOffset,
            });

            const newPosts = response.posts || [];

            if (isRefreshing) {
                setPosts(newPosts);
            } else {
                setPosts((prevPosts) => [...prevPosts, ...newPosts]);
            }

            setHasMore(newPosts.length === limit);
            if (!isRefreshing) {
                setOffset(currentOffset + limit);
            }
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        loadFeed();
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Refresh feed when screen is focused
            loadFeed(true);
        }, [])
    );

    useEffect(() => {
        if (!socket || !connected) return;

        // Listen for new posts and add to feed
        socket.on('new_post', (data) => {
            setPosts((prevPosts) => [data.post, ...prevPosts]);
        });

        return () => {
            socket.off('new_post');
        };
    }, [socket, connected]);

    const handleRefresh = () => {
        loadFeed(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadFeed();
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
            loadFeed(true);
        }
    };

    const renderPost = ({ item }) => (
        <Post
            post={item}
            onReaction={handleReaction}
            onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
            onChannelPress={() => navigation.navigate('ChannelDetails', { channelId: item.channel_id })}
            onUserPress={() => navigation.navigate('UserProfile', { userId: item.user_id })}
        />
    );

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <EmptyState
                icon="rss"
                title="Your feed is empty"
                description="Subscribe to channels to see posts here"
                buttonText="Discover Channels"
                onButtonPress={() => navigation.navigate('Discover')}
            />
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <>
                    <FlatList
                        data={posts}
                        renderItem={renderPost}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={renderEmpty}
                        ListFooterComponent={renderFooter}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[theme.colors.primary]}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />

                    <FAB
                        style={styles.fab}
                        icon="plus"
                        onPress={() => navigation.navigate('CreatePost')}
                    />
                </>
            )}
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
        flexGrow: 1,
        padding: theme.spacing.md,
    },
    separator: {
        height: theme.spacing.md,
    },
    footerLoader: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: theme.spacing.md,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
    },
});

export default FeedScreen;