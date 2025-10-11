import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePosts } from "../../hooks/usePosts";
import { PostCard } from "../../components/post/PostCard";
import { colors, spacing, typography } from "../../theme";
import { FlatList } from "react-native";

interface ChannelScreenProps {
  route: any;
  navigation: any;
}

export const ChannelScreen: React.FC<ChannelScreenProps> = ({
  route,
  navigation,
}) => {
  const { channelId } = route.params;
  const { posts, isLoading, loadPosts, reactToPost, removeReaction } =
    usePosts(channelId);

  React.useEffect(() => {
    loadPosts();
  }, [channelId]);

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
        refreshing={isLoading}
        onRefresh={loadPosts}
        contentContainerStyle={styles.list}
      />
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
});
