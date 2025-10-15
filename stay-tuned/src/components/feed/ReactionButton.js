// src/components/feed/ReactionButton.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { theme } from '../../theme/theme';

const REACTIONS = [
    { type: 'heart', icon: 'heart', label: 'Heart' },
    { type: 'clap', icon: 'hand-clap', label: 'Clap' },
    { type: 'fire', icon: 'fire', label: 'Fire' },
    { type: 'hundred', icon: '100', label: '100' },
];

const ReactionButton = ({ reaction, onReact, size = 'normal' }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const getIconSize = () => {
        if (size === 'small') return 18;
        if (size === 'large') return 28;
        return 22; // normal
    };

    const getButtonSize = () => {
        if (size === 'small') return 30;
        if (size === 'large') return 44;
        return 36; // normal
    };

    const getActiveReaction = () => {
        if (!reaction) return null;
        return REACTIONS.find(r => r.type === reaction) || null;
    };

    const activeReaction = getActiveReaction();

    const handlePress = () => {
        if (activeReaction) {
            // If already reacted, remove reaction
            onReact(activeReaction.type);
        } else {
            // Show reaction options
            setModalVisible(true);
        }
    };

    const handleReactionSelect = (reactionType) => {
        setModalVisible(false);
        onReact(reactionType);
    };

    return (
        <View>
            <IconButton
                icon={activeReaction ? activeReaction.icon : 'emoticon-outline'}
                size={getIconSize()}
                onPress={handlePress}
                style={[
                    styles.reactionButton,
                    activeReaction && styles.activeButton,
                    { width: getButtonSize(), height: getButtonSize() }
                ]}
                color={activeReaction ? theme.colors.primary : theme.colors.placeholder}
            />

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.reactionContainer}>
                        {REACTIONS.map((item) => (
                            <TouchableOpacity
                                key={item.type}
                                style={styles.reactionOption}
                                onPress={() => handleReactionSelect(item.type)}
                            >
                                <IconButton
                                    icon={item.icon}
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text style={styles.reactionLabel}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    reactionButton: {
        margin: 0,
        backgroundColor: 'transparent',
    },
    activeButton: {
        backgroundColor: `${theme.colors.primary}10`,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reactionContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        padding: theme.spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    reactionOption: {
        alignItems: 'center',
        marginHorizontal: theme.spacing.xs,
        width: 60,
    },
    reactionLabel: {
        ...theme.typography.bodySmall,
        marginTop: 2,
    },
});

export default ReactionButton;