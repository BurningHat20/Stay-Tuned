import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { colors, typography, spacing } from "../../theme";
import { Avatar } from "../common/Avatar";
import { ReactionButton } from "./ReactionButton";
import { REACTION_TYPES } from "../../config/constants";
import { Ionicons } from "@expo/vector-icons";

interface PostCardProps {
  post: any;
  onReact: (postId: number, reactionType: string) => void;
  onRemoveReaction: (postId: number) => void;
  onDelete?: (postId: number) => void;
  currentUserId?: number;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onReact,
  onRemoveReaction,
  onDelete,
  currentUserId,
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

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete?.(post.id),
      },
    ]);
  };

  const isOwner = currentUserId && post.user_id === currentUserId;

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
        <View style={styles.headerRight}>
          {post.post_type && post.post_type !== "text" && (
            <View style={styles.postTypeIndicator}>
              <Ionicons
                name={
                  post.post_type === "voice"
                    ? "mic"
                    : post.post_type === "image"
                    ? "image"
                    : post.post_type === "location"
                    ? "location"
                    : post.post_type === "status"
                    ? "happy"
                    : "text"
                }
                size={14}
                color={colors.primary}
              />
            </View>
          )}
          <Text style={styles.time}>{formatTime(post.created_at)}</Text>
          {isOwner && onDelete && (
            <TouchableOpacity style={styles.menuButton} onPress={handleDelete}>
              <Ionicons name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
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
  headerRight: {
    alignItems: "flex-end",
  },
  postTypeIndicator: {
    marginBottom: spacing.xs,
  },
  time: {
    ...typography.small,
    color: colors.textTertiary,
  },
  menuButton: {
    marginTop: spacing.xs,
    padding: spacing.xs,
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
