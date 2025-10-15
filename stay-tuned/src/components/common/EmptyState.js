// src/components/common/EmptyState.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { theme } from '../../theme/theme';

const EmptyState = ({
    icon,
    title,
    description,
    buttonText,
    onButtonPress,
    iconSize = 50,
    iconColor = theme.colors.placeholder
}) => {
    return (
        <View style={styles.container}>
            <IconButton
                icon={icon}
                size={iconSize}
                color={iconColor}
                style={styles.icon}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            {buttonText && onButtonPress && (
                <Button
                    mode="contained"
                    onPress={onButtonPress}
                    style={styles.button}
                >
                    {buttonText}
                </Button>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        minHeight: 300,
    },
    icon: {
        backgroundColor: `${theme.colors.placeholder}15`,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.titleMedium,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    description: {
        ...theme.typography.bodyMedium,
        color: theme.colors.placeholder,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    button: {
        marginTop: theme.spacing.md,
    },
});

export default EmptyState;