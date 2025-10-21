// src/components/channels/ChannelCard.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Text, Avatar, Card } from 'react-native-paper';
import { theme } from '../../theme/theme';
import SubscribeButton from './SubscribeButton';

const ChannelCard = ({
    channel,
    onPress,
    onSubscribe,
    onUnsubscribe,
    compact = false,
}) => {
    const {
        id,
        channel_name,
        channel_handle,
        description,
        subscriber_count,
        post_count,
        username,
        full_name,
        avatar_url,
        cover_image_url,
        is_verified,
        is_subscribed,
    } = channel;

    if (compact) {
        return (
            <TouchableOpacity onPress={onPress} style={styles.compactContainer}>
                <Avatar.Image
                    size={50}
                    source={
                        avatar_url
                            ? { uri: avatar_url }
                            : require('../../../assets/images/default-avatar.png')
                    }
                />
                <View style={styles.compactInfo}>
                    <Text style={styles.compactChannelName} numberOfLines={1}>
                        {channel_name}
                    </Text>
                    <Text style={styles.compactSubCount}>
                        {subscriber_count || 0} subscriber{subscriber_count !== 1 ? 's' : ''}
                    </Text>
                </View>
                <SubscribeButton
                    isSubscribed={is_subscribed}
                    onSubscribe={() => onSubscribe(id)}
                    onUnsubscribe={() => onUnsubscribe(id)}
                    compact
                />
            </TouchableOpacity>
        );
    }

    return (
        <Card style={styles.card} onPress={onPress}>
            <ImageBackground
                source={
                    cover_image_url
                        ? { uri: cover_image_url }
                        : require('../../../assets/images/default-cover.jpg')
                }
                style={styles.coverImage}
            >
                <View style={styles.overlay} />
            </ImageBackground>

            <Card.Content style={styles.content}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={70}
                        source={
                            avatar_url
                                ? { uri: avatar_url }
                                : require('../../../assets/images/default-avatar.png')
                        }
                        style={styles.avatar}
                    />
                </View>

                <View style={styles.channelInfo}>
                    <View style={styles.channelHeader}>
                        <Text style={styles.channelName}>{channel_name || 'Unnamed Channel'}</Text>
                        {is_verified && (
                            <View style={styles.verifiedBadge}>
                                <Text style={styles.verifiedText}>✓</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.channelHandle}>@{channel_handle || 'channel'}</Text>
                    <Text style={styles.creatorName}>by {full_name || 'Unknown'}</Text>

                    {description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {description}
                        </Text>
                    )}

                    <View style={styles.stats}>
                        <Text style={styles.statText}>{subscriber_count || 0} subscriber{(subscriber_count || 0) !== 1 ? 's' : ''}</Text>
                        <Text style={styles.statDot}>•</Text>
                        <Text style={styles.statText}>{post_count || 0} post{(post_count || 0) !== 1 ? 's' : ''}</Text>
                    </View>
                </View>

                <SubscribeButton
                    isSubscribed={is_subscribed}
                    onSubscribe={() => onSubscribe(id)}
                    onUnsubscribe={() => onUnsubscribe(id)}
                />
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: theme.spacing.md,
        borderRadius: theme.roundness,
        elevation: theme.elevation.small,
        overflow: 'hidden',
    },
    coverImage: {
        height: 100,
        width: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    content: {
        padding: theme.spacing.md,
    },
    avatarContainer: {
        position: 'absolute',
        top: -35,
        left: theme.spacing.md,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: theme.colors.surface,
    },
    avatar: {
        backgroundColor: theme.colors.surface,
    },
    channelInfo: {
        marginLeft: 80,
        marginTop: 5,
    },
    channelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    channelName: {
        ...theme.typography.titleSmall,
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
        color: theme.colors.surface,
        fontSize: 10,
        fontWeight: 'bold',
    },
    channelHandle: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginBottom: 2,
    },
    creatorName: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginBottom: theme.spacing.xs,
    },
    description: {
        ...theme.typography.bodyMedium,
        marginBottom: theme.spacing.xs,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
    },
    statText: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    statDot: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginHorizontal: theme.spacing.xs,
    },

    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.sm,
    },
    compactInfo: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    compactChannelName: {
        ...theme.typography.bodyLarge,
        fontWeight: '600',
    },
    compactSubCount: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
});

export default ChannelCard;