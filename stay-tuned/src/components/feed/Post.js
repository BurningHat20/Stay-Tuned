// src/components/feed/Post.js
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Card, Text, Avatar, IconButton } from 'react-native-paper';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { theme } from '../../theme/theme';
import ReactionButton from './ReactionButton';

dayjs.extend(relativeTime);

const Post = ({ post, onPress, onChannelPress, onUserPress, onReaction }) => {
    const {
        id,
        content,
        post_type,
        media_url,
        created_at,
        username,
        full_name,
        avatar_url,
        channel_name,
        channel_handle,
        reaction_count,
        user_reaction,
    } = post;

    const formatDate = (date) => {
        return dayjs(date).fromNow();
    };

    const renderMedia = () => {
        if (!media_url) return null;

        if (post_type === 'image') {
            return (
                <Image
                    source={{ uri: media_url }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                />
            );
        }

        // Render other media types if needed
        return null;
    };

    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onUserPress} style={styles.userInfo}>
                        <Avatar.Image
                            size={40}
                            source={
                                avatar_url
                                    ? { uri: avatar_url }
                                    : require('../../../assets/images/default-avatar.png')
                            }
                        />
                        <View style={styles.nameContainer}>
                            <Text style={styles.fullName}>{full_name}</Text>
                            <Text style={styles.username}>@{username}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onChannelPress}>
                        <Text style={styles.channelName}>{channel_name}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.content}>{content}</Text>

                {renderMedia()}

                <View style={styles.footer}>
                    <Text style={styles.timestamp}>{formatDate(created_at)}</Text>

                    <View style={styles.reactions}>
                        <Text style={styles.reactionCount}>
                            {reaction_count > 0 ? reaction_count : ''}
                        </Text>
                        <ReactionButton
                            reaction={user_reaction}
                            onReact={(reactionType) => onReaction(id, reactionType, !!user_reaction, user_reaction)}
                        />
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: theme.spacing.sm,
        borderRadius: theme.roundness,
        elevation: theme.elevation.small,
    },
    cardContent: {
        padding: theme.spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameContainer: {
        marginLeft: theme.spacing.sm,
    },
    fullName: {
        ...theme.typography.bodyLarge,
        fontWeight: '600',
    },
    username: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    channelName: {
        ...theme.typography.bodySmall,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    content: {
        ...theme.typography.bodyLarge,
        marginBottom: theme.spacing.md,
    },
    mediaImage: {
        width: '100%',
        height: 200,
        borderRadius: theme.roundness / 2,
        marginBottom: theme.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    timestamp: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    reactions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reactionCount: {
        ...theme.typography.bodySmall,
        marginRight: theme.spacing.xs,
        color: theme.colors.primary,
    },
});

export default Post;