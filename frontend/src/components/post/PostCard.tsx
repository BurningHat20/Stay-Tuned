import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, typography, spacing } from "../../theme";
import { Avatar } from "../common/Avatar";
import { ReactionButton } from "./ReactionButton";
import { REACTION_TYPES } from "../../config/constants";

interface PostCardProps {
  post: any;
  onReact: (postId: number, reactionType: string) => void;
  onRemoveReaction: (postId: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onReact,
  onRemoveReaction,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h`;
    return `${Math.floor(diffInMins / 1440)}d`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar name={post.username} size={40} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.full_name || post.username}</Text>
          {post.channel_name && (
            <Text style={styles.channelName}>{post.channel_name}</Text>
          )}
        </View>
        <Text style={styles.time}>{formatTime(post.created_at)}</Text>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.actions}>
        <ReactionButton
          reaction={REACTION_TYPES.HEART}
          count={post.reaction_count}
          isActive={post.user_reaction === REACTION_TYPES.HEART}
          onPress={() =>
            post.user_reaction === REACTION_TYPES.HEART
              ? onRemoveReaction(post.id)
              : onReact(post.id, REACTION_TYPES.HEART)
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  username: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  channelName: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  time: {
    ...typography.small,
    color: colors.textTertiary,
  },
  content: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
});
