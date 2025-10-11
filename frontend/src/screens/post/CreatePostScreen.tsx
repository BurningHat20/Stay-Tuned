import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { usePosts } from "../../hooks/usePosts";
import { useChannels } from "../../hooks/useChannels";
import { Button } from "../../components/common/Button";
import { colors, typography, spacing } from "../../theme";
import { LIMITS } from "../../config/constants";

export const CreatePostScreen = ({ navigation, route }: any) => {
  const channelId = route.params?.channelId;
  const { createPost } = usePosts();
  const { myChannels } = useChannels();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Post content cannot be empty");
      return;
    }

    if (!channelId && myChannels.length === 0) {
      Alert.alert("Error", "You need to create a channel first");
      return;
    }

    setLoading(true);
    try {
      await createPost(content, channelId || myChannels[0].id);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor={colors.textTertiary}
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={LIMITS.POST_CONTENT_MAX}
        autoFocus
      />
      <View style={styles.footer}>
        <Button title="Post" onPress={handlePost} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    ...typography.body,
    padding: spacing.lg,
    textAlignVertical: "top",
    color: colors.textPrimary,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
