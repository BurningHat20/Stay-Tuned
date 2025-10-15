// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { showMessage } from 'react-native-flash-message';
import { theme } from '../../theme/theme';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            showMessage({
                message: 'Error',
                description: 'Please enter both email and password',
                type: 'danger',
            });
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            // Navigation is handled by NavigationContainer based on auth state
        } catch (error) {
            showMessage({
                message: 'Login Failed',
                description: error.error || 'Invalid email or password',
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
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Stay Tuned</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={secureTextEntry}
                        mode="outlined"
                        style={styles.input}
                        right={
                            <TextInput.Icon
                                icon={secureTextEntry ? 'eye' : 'eye-off'}
                                onPress={() => setSecureTextEntry(!secureTextEntry)}
                            />
                        }
                    />

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        style={styles.loginButton}
                        loading={loading}
                        disabled={loading}
                    >
                        Log In
                    </Button>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerText}>Sign Up</Text>
                    </TouchableOpacity>
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
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.titleLarge,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text,
    },
    form: {
        width: '100%',
    },
    input: {
        marginBottom: theme.spacing.md,
    },
    loginButton: {
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
    },
    forgotPassword: {
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    forgotPasswordText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.xl,
    },
    footerText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text,
    },
    registerText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginLeft: theme.spacing.xs,
    },
});

export default LoginScreen;