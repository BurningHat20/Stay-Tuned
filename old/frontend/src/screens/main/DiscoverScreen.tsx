import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import { useChannels } from "../../hooks/useChannels";
import { ChannelCard } from "../../components/channel/ChannelCard";
import { colors, spacing, typography } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

export const DiscoverScreen = ({ navigation }: any) => {
  const {
    discoverChannels,
    trendingChannels,
    isDiscoverLoading,
    isTrendingLoading,
    loadDiscoverChannels,
    loadTrendingChannels,
  } = useChannels();
  const [searchQuery, setSearchQuery] = useState("");
  const [showTrending, setShowTrending] = useState(true);

  useEffect(() => {
    loadDiscoverChannels();
    loadTrendingChannels();
  }, []);

  const handleSearch = () => {
    loadDiscoverChannels({ search: searchQuery || undefined });
  };

  const handleChannelPress = (channel: any) => {
    // Navigate to channel details or posts
    navigation.navigate("Channel", { channelId: channel.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Find new channels to follow</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search channels..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showTrending && trendingChannels.length > 0 && (
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <TouchableOpacity onPress={() => setShowTrending(false)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={trendingChannels}
            keyExtractor={(item) => `trending-${item.id}`}
            renderItem={({ item }) => (
              <ChannelCard
                channel={item}
                onPress={() => handleChannelPress(item)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingList}
          />
        </View>
      )}

      <View style={styles.discoverSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? `Search Results for "${searchQuery}"` : "Discover"}
        </Text>
      </View>

      <FlatList
        data={discoverChannels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ChannelCard
            channel={item}
            onPress={() => handleChannelPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isDiscoverLoading}
            onRefresh={() =>
              loadDiscoverChannels({ search: searchQuery || undefined })
            }
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isDiscoverLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No channels found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    ...typography.body,
  },
  searchButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  trendingSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  trendingList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  discoverSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl * 2,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
