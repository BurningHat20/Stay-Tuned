// src/navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';
import { theme } from '../theme/theme';

// Stack Screens
import FeedScreen from '../screens/feed/FeedScreen';
import PostDetailScreen from '../screens/feed/PostDetailScreen';
import DiscoverScreen from '../screens/discover/DiscoverScreen';
import SearchScreen from '../screens/discover/SearchScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyChannelsScreen from '../screens/channel/MyChannelsScreen';
import CreateChannelScreen from '../screens/channel/CreateChannelScreen';
import EditChannelScreen from '../screens/channel/EditChannelScreen';
import ChannelDetailScreen from '../screens/channel/ChannelDetailScreen';

const Tab = createBottomTabNavigator();
const FeedStack = createStackNavigator();
const DiscoverStack = createStackNavigator();
const CreatePostStack = createStackNavigator();
const NotificationsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Helper function to get header title
const getHeaderTitle = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Feed';

    const titles = {
        Feed: 'Your Feed',
        Discover: 'Discover Channels',
        CreatePost: 'Create Post',
        Notifications: 'Notifications',
        Profile: 'Profile'
    };

    return titles[routeName] || 'Stay Tuned';
};

// Stack Navigators
const FeedStackNavigator = () => {
    return (
        <FeedStack.Navigator>
            <FeedStack.Screen
                name="Feed"
                component={FeedScreen}
                options={{ title: 'Your Feed' }}
            />
            <FeedStack.Screen
                name="PostDetails"
                component={PostDetailScreen}
                options={{ title: 'Post' }}
            />
            <FeedStack.Screen
                name="ChannelDetails"
                component={ChannelDetailScreen}
                options={({ route }) => ({
                    title: route.params?.channelName || 'Channel'
                })}
            />
        </FeedStack.Navigator>
    );
};

const DiscoverStackNavigator = () => {
    return (
        <DiscoverStack.Navigator>
            <DiscoverStack.Screen
                name="Discover"
                component={DiscoverScreen}
                options={{ title: 'Discover Channels' }}
            />
            <DiscoverStack.Screen
                name="Search"
                component={SearchScreen}
                options={{ title: 'Search' }}
            />
            <DiscoverStack.Screen
                name="ChannelDetails"
                component={ChannelDetailScreen}
                options={({ route }) => ({
                    title: route.params?.channelName || 'Channel'
                })}
            />
        </DiscoverStack.Navigator>
    );
};

const CreatePostStackNavigator = () => {
    return (
        <CreatePostStack.Navigator>
            <CreatePostStack.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{ title: 'Create Post' }}
            />
        </CreatePostStack.Navigator>
    );
};

const NotificationsStackNavigator = () => {
    return (
        <NotificationsStack.Navigator>
            <NotificationsStack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ title: 'Notifications' }}
            />
        </NotificationsStack.Navigator>
    );
};

const ProfileStackNavigator = () => {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profile', headerShown: false }}
            />
            <ProfileStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Edit Profile' }}
            />
            <ProfileStack.Screen
                name="MyChannels"
                component={MyChannelsScreen}
                options={{ title: 'My Channels' }}
            />
            <ProfileStack.Screen
                name="CreateChannel"
                component={CreateChannelScreen}
                options={{ title: 'Create Channel' }}
            />
            <ProfileStack.Screen
                name="EditChannel"
                component={EditChannelScreen}
                options={{ title: 'Edit Channel' }}
            />
        </ProfileStack.Navigator>
    );
};

// Tab Navigator
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'FeedTab') {
                        iconName = 'home';
                    } else if (route.name === 'DiscoverTab') {
                        iconName = 'compass';
                    } else if (route.name === 'CreatePostTab') {
                        iconName = 'plus-circle';
                    } else if (route.name === 'NotificationsTab') {
                        iconName = 'bell';
                    } else if (route.name === 'ProfileTab') {
                        iconName = 'account';
                    }

                    return <IconButton icon={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.placeholder,
                headerShown: false
            })}
        >
            <Tab.Screen
                name="FeedTab"
                component={FeedStackNavigator}
                options={({ route }) => ({
                    title: 'Feed',
                    tabBarLabel: 'Feed'
                })}
            />
            <Tab.Screen
                name="DiscoverTab"
                component={DiscoverStackNavigator}
                options={{
                    title: 'Discover',
                    tabBarLabel: 'Discover'
                }}
            />
            <Tab.Screen
                name="CreatePostTab"
                component={CreatePostStackNavigator}
                options={{
                    title: 'Create',
                    tabBarLabel: 'Create'
                }}
            />
            <Tab.Screen
                name="NotificationsTab"
                component={NotificationsStackNavigator}
                options={{
                    title: 'Notifications',
                    tabBarLabel: 'Alerts'
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{
                    title: 'Profile',
                    tabBarLabel: 'Profile'
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;