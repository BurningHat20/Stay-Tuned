// src/screens/channel/CreateChannelScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Switch, Chip, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { showMessage } from 'react-native-flash-message';
import channelService from '../../services/channelService';
import { theme } from '../../theme/theme';

const CHANNEL_TYPES = [
    { value: 'personal', label: 'Personal' },
    { value: 'professional', label: 'Professional' },
    { value: 'interest', label: 'Interest' },
    { value: 'event', label: 'Event' },
    { value: 'business', label: 'Business' },
];

const CATEGORIES = [
    'Technology', 'Entertainment', 'Sports', 'News',
    'Business', 'Science', 'Health', 'Art', 'Music', 'Gaming'
];

const CreateChannelScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        channelName: '',
        channelHandle: '',
        description: '',
        channelType: 'personal',
        category: '',
        isPrivate: false,
        coverImageUrl: null,
    });

    const [loading, setLoading] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'description') {
            setCharacterCount(value.length);
        }
    };

    const pickCoverImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permission to upload images');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            // In a real app, you would upload the image to a server here
            // and then update the coverImageUrl with the returned URL
            handleChange('coverImageUrl', result.assets[0].uri);
        }
    };

    const generateHandle = () => {
        if (!formData.channelName) return;

        const handle = formData.channelName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');

        handleChange('channelHandle', handle);
    };

    const validateForm = () => {
        if (!formData.channelName) {
            showMessage({
                message: 'Channel name is required',
                type: 'warning',
            });
            return false;
        }

        if (!formData.channelHandle) {
            showMessage({
                message: 'Channel handle is required',
                type: 'warning',
            });
            return false;
        }

        // Channel handle validation
        const handleRegex = /^[a-z0-9-_]{3,50}$/;
        if (!handleRegex.test(formData.channelHandle)) {
            showMessage({
                message: 'Invalid channel handle',
                description: 'Handle must be 3-50 characters and can only contain lowercase letters, numbers, hyphens, and underscores',
                type: 'warning',
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await channelService.createChannel(formData);

            showMessage({
                message: 'Channel created successfully',
                type: 'success',
            });

            navigation.navigate('ChannelDetails', {
                channelId: response.channel.id,
                channelName: response.channel.channel_name
            });
        } catch (error) {
            console.error('Error creating channel:', error);

            if (error.error === 'Channel handle already taken') {
                showMessage({
                    message: 'Channel handle already taken',
                    description: 'Please choose a different handle',
                    type: 'warning',
                });
            } else if (error.error === 'Channel limit reached for free account (3 channels)') {
                showMessage({
                    message: 'Channel limit reached',
                    description: 'Upgrade to premium to create more channels',
                    type: 'warning',
                });
            } else {
                showMessage({
                    message: 'Failed to create channel',
                    description: error.error || 'Please try again',
                    type: 'danger',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                    {/* Cover Image */}
                    <TouchableOpacity style={styles.coverImageContainer} onPress={pickCoverImage}>
                        {formData.coverImageUrl ? (
                            <Image
                                source={{ uri: formData.coverImageUrl }}
                                style={styles.coverImage}
                            />
                        ) : (
                            <View style={styles.coverImagePlaceholder}>
                                <Text style={styles.coverImagePlaceholderText}>Add Cover Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Channel Name */}
                    <Text style={styles.inputLabel}>Channel Name *</Text>
                    <TextInput
                        value={formData.channelName}
                        onChangeText={(text) => handleChange('channelName', text)}
                        style={styles.input}
                        placeholder="Enter channel name"
                        onBlur={generateHandle}
                        maxLength={100}
                    />

                    // src/screens/channel/CreateChannelScreen.js (continued)
                    {/* Channel Handle */}
                    <Text style={styles.inputLabel}>Channel Handle *</Text>
                    <TextInput
                        value={formData.channelHandle}
                        onChangeText={(text) => handleChange('channelHandle', text.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                        style={styles.input}
                        placeholder="Enter channel handle"
                        maxLength={50}
                        autoCapitalize="none"
                    />
                    <Text style={styles.inputHelper}>
                        This will be the unique identifier for your channel: staytuned.com/@{formData.channelHandle || 'handle'}
                    </Text>

                    {/* Channel Description */}
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        value={formData.description}
                        onChangeText={(text) => handleChange('description', text)}
                        style={styles.textArea}
                        placeholder="Tell people about your channel"
                        multiline
                        numberOfLines={5}
                        maxLength={500}
                    />
                    <Text style={styles.charCount}>{characterCount}/500</Text>

                    {/* Channel Type */}
                    <Text style={styles.inputLabel}>Channel Type</Text>
                    <View style={styles.typeContainer}>
                        {CHANNEL_TYPES.map((type) => (
                            <Chip
                                key={type.value}
                                selected={formData.channelType === type.value}
                                onPress={() => handleChange('channelType', type.value)}
                                style={styles.typeChip}
                                selectedColor={theme.colors.primary}
                            >
                                {type.label}
                            </Chip>
                        ))}
                    </View>

                    {/* Category */}
                    <Text style={styles.inputLabel}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                        {CATEGORIES.map((category) => (
                            <Chip
                                key={category}
                                selected={formData.category === category}
                                onPress={() => handleChange('category', category)}
                                style={styles.categoryChip}
                                selectedColor={theme.colors.primary}
                            >
                                {category}
                            </Chip>
                        ))}
                    </ScrollView>

                    {/* Privacy Toggle */}
                    <View style={styles.privacyContainer}>
                        <View>
                            <Text style={styles.inputLabel}>Private Channel</Text>
                            <Text style={styles.inputHelper}>
                                Private channels are only visible to subscribers
                            </Text>
                        </View>
                        <Switch
                            value={formData.isPrivate}
                            onValueChange={(value) => handleChange('isPrivate', value)}
                            color={theme.colors.primary}
                        />
                    </View>

                    {/* Submit Button */}
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        style={styles.submitButton}
                    >
                        Create Channel
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
    },
    form: {
        padding: theme.spacing.md,
    },
    coverImageContainer: {
        width: '100%',
        height: 150,
        marginBottom: theme.spacing.md,
        borderRadius: theme.roundness,
        overflow: 'hidden',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coverImagePlaceholderText: {
        ...theme.typography.bodyLarge,
        color: '#757575',
    },
    inputLabel: {
        ...theme.typography.bodyLarge,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    input: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.xs,
    },
    inputHelper: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        marginBottom: theme.spacing.md,
    },
    textArea: {
        backgroundColor: theme.colors.surface,
        minHeight: 120,
        textAlignVertical: 'top',
        marginBottom: theme.spacing.xs,
    },
    charCount: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
        textAlign: 'right',
        marginBottom: theme.spacing.md,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: theme.spacing.md,
    },
    typeChip: {
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    categoriesContainer: {
        marginBottom: theme.spacing.md,
    },
    categoryChip: {
        marginRight: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
    },
    privacyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    submitButton: {
        marginBottom: theme.spacing.md,
    },
    cancelButton: {
        marginBottom: theme.spacing.xl,
    },
});

export default CreateChannelScreen;