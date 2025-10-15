// src/screens/discover/DiscoverScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Chip, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import ChannelCard from '../../components/channels/ChannelCard';
import EmptyState from '../../components/common/EmptyState';
import channelService from '../../services/channelService';
import subscriptionService from '../../services/subscriptionService';
import { theme } from '../../theme/theme';
import { showMessage } from 'react-native-flash-message';

const CATEGORIES = [
    'Technology', 'Entertainment', 'Sports', 'News',
    'Business', 'Science', 'Health', 'Art', 'Music', 'Gaming'
];

const DiscoverScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [channels, setChannels] = useState([]);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trendingLoading, setTrendingLoading] = useState(true);

    const fetchChannels = async (category = '', search = '') => {
        setLoading(true);
        try {
            const params = { limit: 20 };
            if (category) params.category = category;
            if (search) params.search = search;

            const response = await channelService.discoverChannels(params);
            setChannels(response.channels || []);
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrending = async () => {
        setTrendingLoading(true);
        try {
            const response = await channelService.getTrendingChannels(5);
            setTrending(response.channels || []);
        } catch (error) {
            console.error('Error fetching trending channels:', error);
        } finally {
            setTrendingLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChannels(selectedCategory, searchQuery);
            fetchTrending();
        }, [])
    );

    useEffect(() => {
        fetchChannels(selectedCategory, searchQuery);
    }, [selectedCategory]);

    const handleSearch = () => {
        fetchChannels(selectedCategory, searchQuery);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category === selectedCategory ? '' : category);
    };

    const handleSubscribe = async (channelId) => {
        try {
            await subscriptionService.subscribeToChannel(channelId);

            // Update local state
            setChannels(prevChannels =>
                prevChannels.map(channel =>
                    channel.id === channelId
                        ? { ...channel, is_subscribed: true, subscriber_count: channel.subscriber_count + 1 }
                        : channel
                )
            );

            setTrending(prevTrending =>
                prevTrending.map(channel =>
                    channel.id === channelId
                        ? { ...channel, is_subscribed: true, subscriber_count: channel.subscriber_count + 1 }
                        : channel
                )
            );

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
        }
    };

    const handleUnsubscribe = async (channelId) => {
        try {
            await subscriptionService.unsubscribeFromChannel(channelId);

            // Update local state
            setChannels(prevChannels =>
                prevChannels.map(channel =>
                    channel.id === channelId
                        ? { ...channel, is_subscribed: false, subscriber_count: Math.max(0, channel.subscriber_count - 1) }
                        : channel
                )
            );

            setTrending(prevTrending =>
                prevTrending.map(channel =>
                    channel.id === channelId
                        ? { ...channel, is_subscribed: false, subscriber_count: Math.max(0, channel.subscriber_count - 1) }
                        : channel
                )
            );

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
        }
    };

    const renderCategory = ({ item }) => (
        <Chip
            selected={selectedCategory === item}
            onPress={() => handleCategorySelect(item)}
            style={styles.categoryChip}
            selectedColor={theme.colors.primary}
        >
            {item}
        </Chip>
    );

    const renderTrendingChannel = ({ item }) => (
        <ChannelCard
            channel={item}
            compact={true}
            onPress={() => navigation.navigate('ChannelDetails', { channelId: item.id, channelName: item.channel_name })}
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
        />
    );

    const renderChannel = ({ item }) => (
        <ChannelCard
            channel={item}
            onPress={() => navigation.navigate('ChannelDetails', { channelId: item.id, channelName: item.channel_name })}
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
        />
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search channels"
                onChangeText={setSearchQuery}
                value={searchQuery}
                onSubmitEditing={handleSearch}
                style={styles.searchBar}
            />

            <FlatList
                horizontal
                data={CATEGORIES}
                renderItem={renderCategory}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
            />

            <View style={styles.content}>
                {/* Trending Channels Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Trending Now</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Search', { filter: 'trending' })}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

                {trendingLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
                ) : (
                    <FlatList
                        data={trending}
                        renderItem={renderTrendingChannel}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.trendingList}
                    />
                )}

                <Divider style={styles.divider} />

                {/* Discover Channels Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                        {selectedCategory ? `${selectedCategory} Channels` : 'Discover Channels'}
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                ) : (
                    <FlatList
                        data={channels}
                        renderItem={renderChannel}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.channelsList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <EmptyState
                                icon="compass-off"
                                title="No channels found"
                                description={
                                    selectedCategory
                                        ? `No channels found in ${selectedCategory} category.`
                                        : 'Try adjusting your search or browse another category.'
                                }
                                buttonText="Clear filters"
                                onButtonPress={() => {
                                    setSelectedCategory('');
                                    setSearchQuery('');
                                    fetchChannels();
                                }}
                            />
                        }
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    searchBar: {
        margin: theme.spacing.md,
        elevation: 2,
    },
    categoriesList: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
    },
    categoryChip: {
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    sectionTitle: {
        ...theme.typography.titleSmall,
    },
    seeAllText: {
        ...theme.typography.bodySmall,
        color: theme.colors.primary,
    },
    trendingList: {
        paddingVertical: theme.spacing.sm,
    },
    channelsList: {
        paddingBottom: theme.spacing.xl,
    },
    divider: {
        marginVertical: theme.spacing.md,
    },
    loader: {
        marginVertical: theme.spacing.lg,
    },
});

export default DiscoverScreen;