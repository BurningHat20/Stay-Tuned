import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, typography, spacing } from "../../theme";
import { REACTION_EMOJIS } from "../../config/constants";

interface ReactionButtonProps {
  reaction: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  reaction,
  count,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.active]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>
        {REACTION_EMOJIS[reaction as keyof typeof REACTION_EMOJIS]}
      </Text>
      {count > 0 && <Text style={styles.count}>{count}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  active: {
    backgroundColor: colors.primaryLight + "20",
  },
  emoji: {
    fontSize: 18,
  },
  count: {
    ...typography.small,
    marginLeft: spacing.xs,
    color: colors.textSecondary,
  },
});
