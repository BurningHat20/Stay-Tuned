// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { showMessage } from 'react-native-flash-message';
import { theme } from '../../theme/theme';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    });

    const [secureTextEntry, setSecureTextEntry] = useState({
        password: true,
        confirmPassword: true,
    });

    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleSecureEntry = (field) => {
        setSecureTextEntry(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            showMessage({
                message: 'All fields are required',
                type: 'danger',
            });
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            showMessage({
                message: 'Passwords do not match',
                type: 'danger',
            });
            return false;
        }

        if (formData.password.length < 6) {
            showMessage({
                message: 'Password must be at least 6 characters',
                type: 'danger',
            });
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showMessage({
                message: 'Please enter a valid email address',
                type: 'danger',
            });
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName || formData.username,
            });
            // If successful, navigation will be handled by AuthContext
        } catch (error) {
            showMessage({
                message: 'Registration Failed',
                description: error.error || 'Unable to create account. Please try again.',
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
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.title}>Create Account</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Username"
                        value={formData.username}
                        onChangeText={(text) => handleChange('username', text)}
                        style={styles.input}
                        autoCapitalize="none"
                        mode="outlined"
                    />

                    <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => handleChange('email', text)}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        mode="outlined"
                    />

                    <TextInput
                        label="Full Name (Optional)"
                        value={formData.fullName}
                        onChangeText={(text) => handleChange('fullName', text)}
                        style={styles.input}
                        mode="outlined"
                    />

                    <TextInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(text) => handleChange('password', text)}
                        secureTextEntry={secureTextEntry.password}
                        style={styles.input}
                        mode="outlined"
                        right={
                            <TextInput.Icon
                                icon={secureTextEntry.password ? 'eye' : 'eye-off'}
                                onPress={() => toggleSecureEntry('password')}
                            />
                        }
                    />

                    <TextInput
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChangeText={(text) => handleChange('confirmPassword', text)}
                        secureTextEntry={secureTextEntry.confirmPassword}
                        style={styles.input}
                        mode="outlined"
                        right={
                            <TextInput.Icon
                                icon={secureTextEntry.confirmPassword ? 'eye' : 'eye-off'}
                                onPress={() => toggleSecureEntry('confirmPassword')}
                            />
                        }
                    />

                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                    >
                        Create Account
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginButton}
                        labelStyle={styles.loginButtonLabel}
                    >
                        Log In
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
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 40 : 10,
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.titleMedium,
    },
    form: {
        marginTop: theme.spacing.md,
    },
    input: {
        marginBottom: theme.spacing.md,
    },
    button: {
        marginTop: theme.spacing.md,
        paddingVertical: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    footerText: {
        ...theme.typography.bodyMedium,
    },
    loginButton: {
        marginLeft: theme.spacing.xs,
    },
    loginButtonLabel: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        marginVertical: 0,
        marginHorizontal: 0,
    },
});

export default RegisterScreen;