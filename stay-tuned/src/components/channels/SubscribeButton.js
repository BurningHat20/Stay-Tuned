// src/components/channels/SubscribeButton.js
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { theme } from '../../theme/theme';

const SubscribeButton = ({
    isSubscribed,
    onSubscribe,
    onUnsubscribe,
    loading: externalLoading,
    compact = false
}) => {
    const [internalLoading, setInternalLoading] = useState(false);

    // Use either external loading state or internal
    const loading = externalLoading !== undefined ? externalLoading : internalLoading;

    const handleSubscribe = async () => {
        setInternalLoading(true);
        try {
            if (isSubscribed) {
                await onUnsubscribe();
            } else {
                await onSubscribe();
            }
        } catch (error) {
            console.error('Subscription action failed:', error);
        } finally {
            setInternalLoading(false);
        }
    };

    if (compact) {
        return (
            <Button
                mode={isSubscribed ? "outlined" : "contained"}
                onPress={handleSubscribe}
                loading={loading}
                compact
                style={isSubscribed ? styles.compactUnsubscribeButton : styles.compactSubscribeButton}
                labelStyle={styles.compactButtonLabel}
            >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
        );
    }

    return (
        <Button
            mode={isSubscribed ? "outlined" : "contained"}
            onPress={handleSubscribe}
            loading={loading}
            style={isSubscribed ? styles.unsubscribeButton : styles.subscribeButton}
            icon={isSubscribed ? "check" : "plus"}
        >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </Button>
    );
};

const styles = StyleSheet.create({
    subscribeButton: {
        marginTop: theme.spacing.md,
    },
    unsubscribeButton: {
        marginTop: theme.spacing.md,
        borderColor: theme.colors.primary,
    },
    compactSubscribeButton: {
        paddingHorizontal: theme.spacing.sm,
    },
    compactUnsubscribeButton: {
        paddingHorizontal: theme.spacing.sm,
        borderColor: theme.colors.primary,
    },
    compactButtonLabel: {
        fontSize: 12,
    },
});

export default SubscribeButton;