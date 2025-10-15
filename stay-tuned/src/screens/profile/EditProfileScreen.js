// src/screens/profile/EditProfileScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { showMessage } from 'react-native-flash-message';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { theme } from '../../theme/theme';

const EditProfileScreen = ({ navigation }) => {
    const { user, updateUserProfile } = useAuth();

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        bio: user?.bio || '',
        avatar_url: user?.avatar_url || null,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permission to update your avatar');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            // In a real app, you would upload the image to a server here
            // and then update the avatar_url with the returned URL
            // For now, we'll just use the local URI
            handleChange('avatar_url', result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await authService.updateProfile(formData);

            // Update local user state
            updateUserProfile(response.user);

            showMessage({
                message: 'Profile updated successfully',
                type: 'success',
            });

            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage({
                message: 'Failed to update profile',
                description: error.error || 'Please try again',
                type: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={100}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Avatar.Image
                            size={100}
                            source={
                                formData.avatar_url
                                    ? { uri: formData.avatar_url }
                                    : require('../../../assets/images/default-avatar.png')
                            }
                        />
                        <View style={styles.editAvatarButton}>
                            <Text style={styles.editAvatarText}>Edit</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Full Name"
                        value={formData.full_name}
                        onChangeText={(text) => handleChange('full_name', text)}
                        style={styles.input}
                        mode="outlined"
                    />

                    <TextInput
                        label="Bio"
                        value={formData.bio}
                        onChangeText={(text) => handleChange('bio', text)}
                        style={styles.bioInput}
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        mode="outlined"
                    />

                    <View style={styles.characterCount}>
                        <Text style={styles.characterCountText}>
                            {formData.bio?.length || 0}/500
                        </Text>
                    </View>

                    <Text style={styles.emailLabel}>Email</Text>
                    <TextInput
                        value={user?.email || ''}
                        editable={false}
                        style={styles.disabledInput}
                        mode="outlined"
                    />

                    <Text style={styles.usernameLabel}>Username</Text>
                    <TextInput
                        value={user?.username || ''}
                        editable={false}
                        style={styles.disabledInput}
                        mode="outlined"
                    />
                </View>

                <View style={styles.buttonsContainer}>
                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={loading}
                        style={styles.saveButton}
                    >
                        Save Changes
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
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.md,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.md,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
    },
    editAvatarText: {
        color: '#fff',
        fontSize: 12,
    },
    form: {
        marginBottom: theme.spacing.lg,
    },
    input: {
        marginBottom: theme.spacing.md,
    },
    bioInput: {
        marginBottom: theme.spacing.xs,
        height: 100,
    },
    characterCount: {
        alignItems: 'flex-end',
        marginBottom: theme.spacing.md,
    },
    characterCountText: {
        ...theme.typography.bodySmall,
        color: theme.colors.placeholder,
    },
    emailLabel: {
        ...theme.typography.bodyMedium,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    usernameLabel: {
        ...theme.typography.bodyMedium,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.md,
    },
    disabledInput: {
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface,
    },
    buttonsContainer: {
        marginTop: theme.spacing.lg,
    },
    saveButton: {
        marginBottom: theme.spacing.md,
    },
    cancelButton: {
        borderColor: theme.colors.placeholder,
    },
});

export default EditProfileScreen;