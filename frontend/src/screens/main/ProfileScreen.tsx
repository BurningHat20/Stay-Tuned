import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useChannels } from "../../hooks/useChannels";
import { useSubscriptions } from "../../hooks/useSubscriptions";
import { colors, spacing, typography } from "../../theme";
import { Avatar } from "../../components/common/Avatar";
import { Ionicons } from "@expo/vector-icons";

export const ProfileScreen = ({ navigation }: any) => {
  const { user, isAuthenticated, logout, refreshProfile } = useAuth();
  const {
    myChannels,
    isLoading: channelsLoading,
    loadMyChannels,
  } = useChannels();
  const {
    subscriptions,
    isLoading: subscriptionsLoading,
    updateNotificationLevel,
  } = useSubscriptions();

  useEffect(() => {
    if (isAuthenticated) {
      loadMyChannels();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  const handleSearchUsers = () => {
    navigation.navigate("UserSearch");
  };

  const handleRefresh = async () => {
    await refreshProfile();
    await loadMyChannels();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Not logged in</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Avatar name={user?.username} size={80} />
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>
            {user?.full_name || user?.username}
          </Text>
          <Text style={styles.username}>@{user?.username}</Text>
          {user?.bio && <Text style={styles.bio}>{user?.bio}</Text>}
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchUsers}
        >
          <Ionicons name="search" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{myChannels.length}</Text>
          <Text style={styles.statLabel}>Channels</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{user?.account_type || "free"}</Text>
          <Text style={styles.statLabel}>Account</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Channels</Text>
        {channelsLoading ? (
          <Text style={styles.loadingText}>Loading channels...</Text>
        ) : myChannels.length > 0 ? (
          myChannels.map((channel: any) => (
            <View key={channel.id} style={styles.channelItem}>
              <TouchableOpacity
                style={styles.channelContent}
                onPress={() =>
                  navigation.navigate("Channel", { channelId: channel.id })
                }
              >
                <View style={styles.channelHeader}>
                  <Avatar name={channel.channel_name} size={40} />
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelName}>
                      {channel.channel_name}
                    </Text>
                    <Text style={styles.channelHandle}>
                      @{channel.channel_handle}
                    </Text>
                  </View>
                </View>
                <Text style={styles.channelStats}>
                  {channel.subscriber_count} subscribers • {channel.post_count}{" "}
                  posts
                </Text>
              </TouchableOpacity>
              <View style={styles.channelActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate("EditChannel", {
                      channelId: channel.id,
                    })
                  }
                >
                  <Ionicons name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No channels yet</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscriptions</Text>
        {subscriptionsLoading ? (
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        ) : subscriptions.length > 0 ? (
          subscriptions.map((subscription: any) => (
            <View key={subscription.id} style={styles.subscriptionItem}>
              <TouchableOpacity
                style={styles.subscriptionContent}
                onPress={() =>
                  navigation.navigate("Channel", { channelId: subscription.id })
                }
              >
                <View style={styles.subscriptionHeader}>
                  <Avatar name={subscription.channel_name} size={40} />
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.channelName}>
                      {subscription.channel_name}
                    </Text>
                    <Text style={styles.channelHandle}>
                      @{subscription.channel_handle}
                    </Text>
                  </View>
                </View>
                <Text style={styles.subscriptionStats}>
                  {subscription.subscriber_count} subscribers •{" "}
                  {subscription.post_count} posts
                </Text>
              </TouchableOpacity>
              <View style={styles.notificationSettings}>
                <Text style={styles.notificationLabel}>Notifications:</Text>
                <TouchableOpacity
                  style={[
                    styles.notificationButton,
                    subscription.notification_level === "all" &&
                      styles.notificationButtonActive,
                  ]}
                  onPress={() =>
                    updateNotificationLevel(subscription.id, "all")
                  }
                >
                  <Text
                    style={[
                      styles.notificationText,
                      subscription.notification_level === "all" &&
                        styles.notificationTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.notificationButton,
                    subscription.notification_level === "important" &&
                      styles.notificationButtonActive,
                  ]}
                  onPress={() =>
                    updateNotificationLevel(subscription.id, "important")
                  }
                >
                  <Text
                    style={[
                      styles.notificationText,
                      subscription.notification_level === "important" &&
                        styles.notificationTextActive,
                    ]}
                  >
                    Important
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.notificationButton,
                    subscription.notification_level === "none" &&
                      styles.notificationButtonActive,
                  ]}
                  onPress={() =>
                    updateNotificationLevel(subscription.id, "none")
                  }
                >
                  <Text
                    style={[
                      styles.notificationText,
                      subscription.notification_level === "none" &&
                        styles.notificationTextActive,
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No subscriptions yet</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    margin: spacing.lg,
  },
  loginButtonText: {
    color: colors.surface,
    textAlign: "center",
    ...typography.body,
    fontWeight: "600",
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userInfo: {
    alignItems: "center",
    marginTop: spacing.md,
  },
  fullName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  username: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  bio: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: "center",
  },
  searchButton: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    padding: spacing.sm,
  },
  stats: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    ...typography.h1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  channelItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  channelContent: {
    flex: 1,
  },
  channelHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  channelInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  channelName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  channelHandle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  channelStats: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  channelActions: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    flexDirection: "row",
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  subscriptionItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subscriptionContent: {
    flex: 1,
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriptionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  subscriptionStats: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationSettings: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notificationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  notificationButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  notificationButtonActive: {
    backgroundColor: colors.primary,
  },
  notificationText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  notificationTextActive: {
    color: colors.surface,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    margin: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.error,
    marginLeft: spacing.sm,
    ...typography.body,
    fontWeight: "600",
  },
});
