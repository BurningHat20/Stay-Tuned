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

  useEffect(() => {
    if (isAuthenticated) {
      loadMyChannels();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
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
            <TouchableOpacity
              key={channel.id}
              style={styles.channelItem}
              onPress={() =>
                navigation.navigate("Channel", { channelId: channel.id })
              }
            >
              <View style={styles.channelHeader}>
                <Avatar name={channel.channel_name} size={40} />
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{channel.channel_name}</Text>
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
          ))
        ) : (
          <Text style={styles.emptyText}>No channels yet</Text>
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
