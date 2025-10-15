import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing } from "../../theme";
import { Avatar } from "../common/Avatar";

interface ChannelCardProps {
  channel: any;
  onPress?: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Avatar name={channel.channel_name} size={50} />
        <View style={styles.channelInfo}>
          <Text style={styles.channelName}>{channel.channel_name}</Text>
          <Text style={styles.handle}>@{channel.channel_handle}</Text>
          <Text style={styles.username}>
            by {channel.full_name || channel.username}
          </Text>
        </View>
      </View>

      {channel.description && (
        <Text style={styles.description} numberOfLines={2}>
          {channel.description}
        </Text>
      )}

      <View style={styles.stats}>
        <Text style={styles.stat}>{channel.subscriber_count} subscribers</Text>
        <Text style={styles.stat}>{channel.post_count} posts</Text>
        {channel.category && (
          <Text style={styles.category}>{channel.category}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  channelInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  channelName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  handle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  username: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stat: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  category: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
