// src/screens/profile/ProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, StatusBar, RefreshControl } from 'react-native';
import { Text, Button, Avatar, Card, Divider, IconButton, ActivityIndicator, useTheme } from 'react-native-paper';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import channelService from '../../services/channelService';
import { theme } from '../../theme/theme';

const ProfileScreen = () => {
    const { user } = useAuth();
    const route = useRoute();
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState(null);
    const [userChannels, setUserChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [channelsLoading, setChannelsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Check if viewing own profile or another user's
    const userId = route.params?.userId;
    const isOwnProfile = !userId || userId === user?.id;

    const fetchProfileData = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            if (isOwnProfile) {
                // Use data from auth context for own profile
                setProfileData(user);
            } else {
                // Fetch other user's profile
                const userData = await userService.getUserDetails(userId);
                setProfileData(userData.user);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isOwnProfile, userId, user]);

    const fetchUserChannels = useCallback(async () => {
        setChannelsLoading(true);
        try {
            const response = isOwnProfile
                ? await channelService.getMyChannels()
                : await channelService.getUserChannels(userId);

            setUserChannels(response.channels || []);
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setChannelsLoading(false);
        }
    }, [isOwnProfile, userId]);

    useFocusEffect(
        useCallback(() => {
            fetchProfileData();
            fetchUserChannels();
        }, [fetchProfileData, fetchUserChannels])
    );

    const handleRefresh = () => {
        fetchProfileData(true);
        fetchUserChannels();
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={theme.colors.primary}
                translucent
            />

            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    {isOwnProfile ? (
                        <IconButton
                            icon="cog-outline"
                            iconColor="#fff"
                            size={24}
                            onPress={() => { }}
                        />
                    ) : (
                        <IconButton
                            icon="arrow-left"
                            iconColor="#fff"
                            size={24}
                            onPress={() => navigation.goBack()}
                        />
                    )}

                    {isOwnProfile && (
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('EditProfile')}
                            style={styles.editProfileButton}
                            labelStyle={styles.editProfileLabel}
                        >
                            Edit Profile
                        </Button>
                    )}
                </View>

                <View style={styles.profileInfo}>
                    <Avatar.Image
                        size={80}
                        source={
                            profileData?.avatar_url
                                ? { uri: profileData.avatar_url }
                                : require('../../../assets/images/default-avatar.png')
                        }
                        style={styles.avatar}
                    />

                    <Text style={styles.fullName}>{profileData?.full_name || 'User'}</Text>
                    <Text style={styles.username}>@{profileData?.username || 'username'}</Text>

                    {profileData?.bio && (
                        <Text style={styles.bio}>{profileData.bio}</Text>
                    )}

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{profileData?.channelCount || 0}</Text>
                            <Text style={styles.statLabel}>Channels</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>0</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                {/* User Channels Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Channels</Text>

                    {isOwnProfile && (
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('CreateChannel')}
                            icon="plus"
                        >
                            Create
                        </Button>
                    )}
                </View>

                {channelsLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.channelsLoader} />
                ) : userChannels.length > 0 ? (
                    <View>
                        {userChannels.map((channel) => (
                            <TouchableOpacity
                                key={channel.id}
                                onPress={() => navigation.navigate('ChannelDetails', {
                                    channelId: channel.id,
                                    channelName: channel.channel_name
                                })}
                            >
                                <Card style={styles.channelCard}>
                                    <Card.Content>
                                        <View style={styles.channelCardContent}>
                                            <View>
                                                <Text style={styles.channelName}>{channel.channel_name}</Text>
                                                <Text style={styles.channelHandle}>@{channel.channel_handle}</Text>
                                                {channel.description && (
                                                    <Text style={styles.channelDescription} numberOfLines={2}>
                                                        {channel.description}
                                                    </Text>
                                                )}
                                                <View style={styles.channelStats}>
                                                    <Text style={styles.channelStat}>
                                                        {channel.subscriber_count} subscriber{channel.subscriber_count !== 1 ? 's' : ''}
                                                    </Text>
                                                    <Text style={styles.channelStatDot}>•</Text>
                                                    <Text style={styles.channelStat}>
                                                        {channel.post_count} post{channel.post_count !== 1 ? 's' : ''}
                                                    </Text>
                                                </View>
                                            </View>

                                            <IconButton
                                                icon="chevron-right"
                                                size={24}
                                                iconColor={theme.colors.placeholder}
                                            />
                                        </View>
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        ))}

                        {isOwnProfile && userChannels.length > 0 && (
                            <Button
                                mode="text"
                                onPress={() => navigation.navigate('MyChannels')}
                                style={styles.viewAllButton}
                            >
                                View All Channels
                            </Button>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyChannelsContainer}>
                        <Text style={styles.emptyChannelsText}>
                            {isOwnProfile
                                ? "You haven't created any channels yet"
                                : "This user hasn't created any channels yet"}
                        </Text>

                        {isOwnProfile && (
                            <Button
                                mode="contained"
                                onPress={() => navigation.navigate('CreateChannel')}
                                style={styles.createChannelButton}
                                icon="plus"
                            >
                                Create Channel
                            </Button>
                        )}
                    </View>
                )}

                <Divider style={styles.divider} />

                {/* Account Information */}
                {isOwnProfile && (
                    <View>
                        <Text style={styles.sectionTitle}>Account</Text>

                        <Card style={styles.accountInfoCard}>
                            <Card.Content>
                                <View style={styles.accountInfoItem}>
                                    <Text style={styles.accountInfoLabel}>Account Type</Text>
                                    <Text style={styles.accountInfoValue}>
                                        {profileData?.account_type === 'free' ? 'Free' : 'Premium'}
                                    </Text>
                                </View>

                                <Divider style={styles.accountDivider} />

                                <View style={styles.accountInfoItem}>
                                    <Text style={styles.accountInfoLabel}>Email</Text>
                                    <Text style={styles.accountInfoValue}>{profileData?.email}</Text>
                                </View>

                                <Divider style={styles.accountDivider} />

                                <View style={styles.accountInfoItem}>
                                    <Text style={styles.accountInfoLabel}>Joined</Text>
                                    <Text style={styles.accountInfoValue}>
                                        {profileData?.created_at
                                            ? new Date(profileData.created_at).toLocaleDateString()
                                            : 'Unknown'}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>

                        <Button
                            mode="outlined"
                            onPress={() => { }}
                            style={styles.upgradeButton}
                            icon="arrow-up-circle-outline"
                        >
                            Upgrade to Premium
                        </Button>
                    </View>
                )}

                {/* Log Out Button (for own profile) */}
                {isOwnProfile && (
                    <Button
                        mode="outlined"
                        onPress={() => { }}
                        style={styles.logoutButton}
                        icon="logout"
                        textColor={theme.colors.error}
                    >
                        Log Out
                    </Button>
                )}

                {/* Add some padding at the bottom */}
                <View style={{ height: 40 }} />
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
    header: {
        backgroundColor: theme.colors.primary,
        paddingTop: StatusBar.currentHeight + theme.spacing.md,
        paddingBottom: theme.spacing.xl + 40, // Extra padding to create overlap
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
    },
    editProfileButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    editProfileLabel: {
        color: '#fff',
    },
    profileInfo: {
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    avatar: {
        backgroundColor: theme.colors.surface,
        borderWidth: 3,
        borderColor: '#fff',
    },
    fullName: {
        ...theme.typography.titleMedium,
        color: '#fff',
        marginTop: theme.spacing.md,
    },
    username: {
        ...theme.typography.bodyMedium,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    bio: {
        ...theme.typography.bodyMedium,
        color: '#fff',
        textAlign: 'center',
        marginTop: theme.spacing.sm,
        marginHorizontal: theme.spacing.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        marginTop: theme.spacing.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
    },
    statDivider: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'center',
    },
    statValue: {
        ...theme.typography.titleSmall,
        color: '#fff',
    },
    statLabel: {
        ...theme.typography.bodySmall,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    content: {
        flex: 1,
        marginTop: -40, // Pull content up to create overlap
        paddingHorizontal: theme.spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.titleSmall,
    },
    channelsLoader: {
        marginVertical: theme.spacing.lg,
    },
    channelCard: {
        marginBottom: theme.spacing.md,
    },
    channelCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    channelName: {
        ...theme.typography.bodyLarge,
        fontWeight: '600',
    },
    channelHandle: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginBottom: 4,
    },
    channelDescription: {
        ...theme.typography.bodyMedium,
        marginTop: 2,
    },
    channelStats: {
        flexDirection: 'row',
        marginTop: theme.spacing.xs,
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
    viewAllButton: {
        alignSelf: 'center',
        marginTop: theme.spacing.sm,
    },
    emptyChannelsContainer: {
        padding: theme.spacing.lg,
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
    },
    emptyChannelsText: {
        ...theme.typography.bodyMedium,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    createChannelButton: {
        marginTop: theme.spacing.sm,
    },
    divider: {
        marginVertical: theme.spacing.lg,
    },
    accountInfoCard: {
        marginTop: theme.spacing.md,
    },
    accountInfoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
    },
    accountInfoLabel: {
        ...theme.typography.bodyMedium,
    },
    accountInfoValue: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    accountDivider: {
        marginVertical: 2,
    },
    upgradeButton: {
        marginTop: theme.spacing.md,
    },
    logoutButton: {
        marginTop: theme.spacing.xl,
        borderColor: theme.colors.error,
    },
});

export default ProfileScreen;