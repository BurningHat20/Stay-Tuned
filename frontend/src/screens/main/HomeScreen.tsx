import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { usePosts } from "../../hooks/usePosts";
import { PostCard } from "../../components/post/PostCard";
import { colors, spacing, typography } from "../../theme";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

export const HomeScreen = ({ navigation }: any) => {
  const { posts, isLoading, error, loadPosts, reactToPost, removeReaction } =
    usePosts();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("CreatePost")}
          style={{ marginRight: spacing.md }}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={reactToPost}
            onRemoveReaction={removeReaction}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadPosts}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContent}>
              <Ionicons name="home" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {isAuthenticated ? "Welcome to Stay Tuned!" : "Welcome!"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isAuthenticated
                  ? "Follow channels to see posts in your feed"
                  : "Sign in to see posts from channels you follow"}
              </Text>
              <TouchableOpacity
                style={styles.discoverButton}
                onPress={() =>
                  isAuthenticated
                    ? navigation.navigate("Discover")
                    : navigation.navigate("Login")
                }
              >
                <Text style={styles.discoverButtonText}>
                  {isAuthenticated ? "Discover Channels" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading your feed...</Text>
            </View>
          )
        }
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPosts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  discoverButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  discoverButtonText: {
    color: colors.surface,
    ...typography.body,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    position: "absolute",
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    ...typography.body,
    color: colors.surface,
    flex: 1,
  },
  retryButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginLeft: spacing.md,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "600",
  },
});
