// src/screens/discover/SearchScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Searchbar, SegmentedButtons, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import ChannelCard from '../../components/channels/ChannelCard';
import EmptyState from '../../components/common/EmptyState';
import channelService from '../../services/channelService';
import userService from '../../services/userService';
import subscriptionService from '../../services/subscriptionService';
import { theme } from '../../theme/theme';
import { showMessage } from 'react-native-flash-message';

const SearchScreen = ({ navigation }) => {
    const route = useRoute();
    const initialFilter = route.params?.filter || 'channels';

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState(initialFilter === 'users' ? 'users' : 'channels');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const performSearch = async () => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            if (searchType === 'channels') {
                const response = await channelService.discoverChannels({ search: searchQuery, limit: 20 });
                setResults(response.channels || []);
            } else {
                const response = await userService.searchUsers(searchQuery);
                setResults(response.users || []);
            }
        } catch (error) {
            console.error('Search error:', error);
            showMessage({
                message: 'Search failed',
                description: 'Could not complete search request',
                type: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch();
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchQuery, searchType]);

    const handleSubscribe = async (channelId) => {
        try {
            await subscriptionService.subscribeToChannel(channelId);

            // Update local state
            setResults(prevResults =>
                prevResults.map(channel =>
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
            setResults(prevResults =>
                prevResults.map(channel =>
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

    const renderItem = ({ item }) => {
        if (searchType === 'channels') {
            return (
                <ChannelCard
                    channel={item}
                    onPress={() => navigation.navigate('ChannelDetails', { channelId: item.id, channelName: item.channel_name })}
                    onSubscribe={handleSubscribe}
                    onUnsubscribe={handleUnsubscribe}
                />
            );
        } else {
            // Render user item
            return (
                <View style={styles.userItem}>
                    <Text>User component would go here</Text>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder={`Search ${searchType}`}
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                autoFocus
            />

            <SegmentedButtons
                value={searchType}
                onValueChange={setSearchType}
                buttons={[
                    { value: 'channels', label: 'Channels' },
                    { value: 'users', label: 'Users' },
                ]}
                style={styles.segmentedButtons}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.resultsList}
                    ListEmptyComponent={
                        searchQuery ? (
                            <EmptyState
                                icon="magnify"
                                title={`No ${searchType} found`}
                                description={`We couldn't find any ${searchType} matching "${searchQuery}"`}
                            />
                        ) : (
                            <EmptyState
                                icon="magnify"
                                title="Search for something"
                                description={`Enter a keyword to find ${searchType}`}
                            />
                        )
                    }
                />
            )}
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
    segmentedButtons: {
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsList: {
        paddingHorizontal: theme.spacing.md,
        flexGrow: 1,
    },
    userItem: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.md,
    },
});

export default SearchScreen;