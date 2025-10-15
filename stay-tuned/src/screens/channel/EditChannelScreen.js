// src/screens/channel/EditChannelScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Switch, Chip, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';
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

const EditChannelScreen = ({ navigation }) => {
    const route = useRoute();
    const { channelId } = route.params;

    const [formData, setFormData] = useState({
        channel_name: '',
        description: '',
        channelType: '',
        category: '',
        isPrivate: false,
        cover_image_url: null,
    });

    const [originalData, setOriginalData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);

    useEffect(() => {
        const fetchChannel = async () => {
            try {
                const response = await channelService.getChannelById(channelId);
                const channel = response.channel;

                const data = {
                    channel_name: channel.channel_name,
                    description: channel.description || '',
                    channelType: channel.channel_type,
                    category: channel.category,
                    isPrivate: channel.is_private,
                    cover_image_url: channel.cover_image_url,
                };

                setFormData(data);
                setOriginalData(data);
                setCharacterCount(data.description.length);
            } catch (error) {
                console.error('Error fetching channel:', error);
                showMessage({
                    message: 'Failed to load channel',
                    type: 'danger',
                });
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        fetchChannel();
    }, [channelId]);

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
            // and then update the cover_image_url with the returned URL
            handleChange('cover_image_url', result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!formData.channel_name.trim()) {
            showMessage({
                message: 'Channel name is required',
                type: 'warning',
            });
            return;
        }

        setSaving(true);
        try {
            await channelService.updateChannel(channelId, formData);

            showMessage({
                message: 'Channel updated successfully',
                type: 'success',
            });

            navigation.navigate('ChannelDetails', {
                channelId: channelId,
                channelName: formData.channel_name
            });
        } catch (error) {
            console.error('Error updating channel:', error);
            showMessage({
                message: 'Failed to update channel',
                description: error.error || 'Please try again',
                type: 'danger',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                    {/* Cover Image */}
                    <TouchableOpacity style={styles.coverImageContainer} onPress={pickCoverImage}>
                        {formData.cover_image_url ? (
                            <Image
                                source={{ uri: formData.cover_image_url }}
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
                        value={formData.channel_name}
                        onChangeText={(text) => handleChange('channel_name', text)}
                        style={styles.input}
                        maxLength={100}
                    />

                    {/* Channel Description */}
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        value={formData.description}
                        onChangeText={(text) => handleChange('description', text)}
                        style={styles.textArea}
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
                        loading={saving}
                        disabled={saving}
                        style={styles.submitButton}
                    >
                        Save Changes
                    </Button>

                    <Button
                        mode="outlined"
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                        disabled={saving}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: theme.spacing.md,
    },
    inputHelper: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
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

export default EditChannelScreen;