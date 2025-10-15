// src/screens/post/CreatePostScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import {
    TextInput,
    Button,
    Text,
    IconButton,
    Divider,
    ActivityIndicator,
    Menu,
    Chip
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { showMessage } from 'react-native-flash-message';
import { useAuth } from '../../contexts/AuthContext';
import channelService from '../../services/channelService';
import postService from '../../services/postService';
import { theme } from '../../theme/theme';

const CreatePostScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState(null);
    const [postType, setPostType] = useState('text');
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [userChannels, setUserChannels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [channelsLoading, setChannelsLoading] = useState(true);
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        fetchUserChannels();
    }, []);

    const fetchUserChannels = async () => {
        setChannelsLoading(true);
        try {
            const response = await channelService.getMyChannels();
            setUserChannels(response.channels || []);
            if (response.channels && response.channels.length > 0) {
                setSelectedChannel(response.channels[0]);
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
            showMessage({
                message: 'Could not load your channels',
                description: 'Please try again later',
                type: 'danger',
            });
        } finally {
            setChannelsLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permission to upload images');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setMediaUrl(result.assets[0].uri);
            setPostType('image');
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            showMessage({
                message: 'Post content is required',
                type: 'warning',
            });
            return;
        }

        if (!selectedChannel) {
            showMessage({
                message: 'Please select a channel',
                type: 'warning',
            });
            return;
        }

        setLoading(true);
        try {
            const postData = {
                channelId: selectedChannel.id,
                content: content.trim(),
                postType,
                mediaUrl,
            };

            await postService.createPost(postData);

            showMessage({
                message: 'Post created successfully',
                type: 'success',
            });

            // Reset form
            setContent('');
            setMediaUrl(null);
            setPostType('text');

            // Navigate back to feed
            navigation.navigate('FeedTab');
        } catch (error) {
            console.error('Error creating post:', error);
            showMessage({
                message: 'Failed to create post',
                description: error.error || 'Please try again',
                type: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const removeMedia = () => {
        setMediaUrl(null);
        setPostType('text');
    };

    const renderChannelSelector = () => {
        if (channelsLoading) {
            return (
                <View style={styles.channelLoaderContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.channelLoaderText}>Loading channels...</Text>
                </View>
            );
        }

        if (userChannels.length === 0) {
            return (
                <View style={styles.noChannelsContainer}>
                    <Text style={styles.noChannelsText}>You don't have any channels yet.</Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('ProfileTab', { screen: 'CreateChannel' })}
                        style={styles.createChannelButton}
                    >
                        Create Channel
                    </Button>
                </View>
            );
        }

        return (
            <View style={styles.channelSelectorContainer}>
                <Text style={styles.sectionTitle}>Post to:</Text>
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <TouchableOpacity
                            style={styles.channelSelector}
                            onPress={() => setMenuVisible(true)}
                        >
                            <Text style={styles.channelName}>{selectedChannel?.channel_name || 'Select Channel'}</Text>
                            <IconButton icon="chevron-down" size={20} />
                        </TouchableOpacity>
                    }
                >
                    {userChannels.map((channel) => (
                        <Menu.Item
                            key={channel.id}
                            title={channel.channel_name}
                            onPress={() => {
                                setSelectedChannel(channel);
                                setMenuVisible(false);
                            }}
                        />
                    ))}
                </Menu>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            style={styles.container}
            keyboardVerticalOffset={100}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderChannelSelector()}

                <Divider style={styles.divider} />

                <View style={styles.contentContainer}>
                    <TextInput
                        placeholder="What's on your mind?"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={5}
                        style={styles.contentInput}
                        maxLength={500}
                    />

                    {mediaUrl && (
                        <View style={styles.mediaPreviewContainer}>
                            <Image source={{ uri: mediaUrl }} style={styles.mediaPreview} />
                            <IconButton
                                icon="close-circle"
                                size={24}
                                style={styles.removeMediaButton}
                                onPress={removeMedia}
                            />
                        </View>
                    )}
                </View>

                <View style={styles.mediaOptions}>
                    <Chip
                        icon="image"
                        mode="outlined"
                        onPress={pickImage}
                        style={styles.mediaChip}
                    >
                        Add Image
                    </Chip>
                </View>

                <View style={styles.characterCount}>
                    <Text style={[
                        styles.characterCountText,
                        content.length > 450 && styles.characterCountWarning
                    ]}>
                        {content.length}/500
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading || !content.trim() || !selectedChannel}
                    style={styles.postButton}
                >
                    Post Now
                </Button>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.md,
    },
    channelSelectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.bodyLarge,
        fontWeight: '600',
        marginRight: theme.spacing.md,
    },
    channelSelector: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        padding: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
    },
    channelName: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
    },
    divider: {
        marginVertical: theme.spacing.md,
    },
    contentContainer: {
        marginBottom: theme.spacing.md,
    },
    contentInput: {
        backgroundColor: 'transparent',
        minHeight: 120,
        textAlignVertical: 'top',
        padding: 0,
    },
    mediaPreviewContainer: {
        marginTop: theme.spacing.md,
        position: 'relative',
    },
    mediaPreview: {
        width: '100%',
        height: 200,
        borderRadius: theme.roundness,
    },
    removeMediaButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    mediaOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.md,
    },
    mediaChip: {
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    characterCount: {
        alignItems: 'flex-end',
    },
    characterCountText: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    characterCountWarning: {
        color: theme.colors.warning,
    },
    footer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    postButton: {
        width: '100%',
    },
    channelLoaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    channelLoaderText: {
        ...theme.typography.bodyMedium,
        marginLeft: theme.spacing.md,
    },
    noChannelsContainer: {
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        marginBottom: theme.spacing.md,
    },
    noChannelsText: {
        ...theme.typography.bodyMedium,
        marginBottom: theme.spacing.md,
    },
    createChannelButton: {
        marginTop: theme.spacing.sm,
    },
});

export default CreatePostScreen;