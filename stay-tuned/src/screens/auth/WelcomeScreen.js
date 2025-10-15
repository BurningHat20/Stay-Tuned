// src/screens/auth/WelcomeScreen.js
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { theme } from '../../theme/theme';

const WelcomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>Stay Tuned</Text>
                <Text style={styles.tagline}>Your personal broadcasting platform</Text>
            </View>

            <View style={styles.actionContainer}>
                <Button
                    mode="contained"
                    style={styles.button}
                    onPress={() => navigation.navigate('Login')}
                >
                    Log In
                </Button>

                <Button
                    mode="outlined"
                    style={[styles.button, styles.registerButton]}
                    onPress={() => navigation.navigate('Register')}
                >
                    Create Account
                </Button>

                <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: theme.spacing.md,
    },
    appName: {
        ...theme.typography.titleLarge,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
    },
    tagline: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text,
    },
    actionContainer: {
        width: '100%',
    },
    button: {
        marginBottom: theme.spacing.md,
        paddingVertical: 6,
    },
    registerButton: {
        borderColor: theme.colors.primary,
    },
    termsContainer: {
        marginTop: theme.spacing.lg,
        alignItems: 'center',
    },
    termsText: {
        ...theme.typography.bodySmall,
        textAlign: 'center',
        color: theme.colors.placeholder,
    },
    termsLink: {
        color: theme.colors.primary,
    },
});

export default WelcomeScreen;