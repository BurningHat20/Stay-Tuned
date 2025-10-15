// src/screens/auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { showMessage } from 'react-native-flash-message';
import { theme } from '../../theme/theme';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            showMessage({
                message: 'Email is required',
                type: 'danger',
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage({
                message: 'Please enter a valid email address',
                type: 'danger',
            });
            return;
        }

        setLoading(true);

        // Simulating API call (replace with actual implementation)
        setTimeout(() => {
            setLoading(false);
            showMessage({
                message: 'Password Reset Link Sent',
                description: 'Check your email for instructions to reset your password.',
                type: 'success',
            });
            navigation.goBack();
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
                <Text style={styles.title}>Reset Password</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.instructions}>
                    Enter your email address and we'll send you a link to reset your password.
                </Text>

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                />

                <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.button}
                    loading={loading}
                    disabled={loading}
                >
                    Send Reset Link
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.backButton}
                >
                    Back to Login
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 40 : 10,
        marginHorizontal: theme.spacing.md,
    },
    title: {
        ...theme.typography.titleMedium,
    },
    content: {
        flex: 1,
        padding: theme.spacing.lg,
        justifyContent: 'center',
        marginTop: -50,
    },
    instructions: {
        ...theme.typography.bodyMedium,
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
        color: theme.colors.text,
    },
    input: {
        marginBottom: theme.spacing.lg,
    },
    button: {
        marginBottom: theme.spacing.md,
        paddingVertical: 6,
    },
    backButton: {
        marginTop: theme.spacing.md,
    },
});

export default ForgotPasswordScreen;