import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { usePosts } from "../../hooks/usePosts";
import { useChannels } from "../../hooks/useChannels";
import { Button } from "../../components/common/Button";
import { colors, typography, spacing } from "../../theme";
import { LIMITS } from "../../config/constants";
import { Ionicons } from "@expo/vector-icons";

type PostType = "text" | "voice" | "image" | "location" | "status";

export const CreatePostScreen = ({ navigation, route }: any) => {
  const channelId = route.params?.channelId;
  const { createPost } = usePosts();
  const { myChannels } = useChannels();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [loading, setLoading] = useState(false);

  const postTypeOptions: { type: PostType; label: string; icon: string }[] = [
    { type: "text", label: "Text", icon: "text" },
    { type: "voice", label: "Voice", icon: "mic" },
    { type: "image", label: "Image", icon: "image" },
    { type: "location", label: "Location", icon: "location" },
    { type: "status", label: "Status", icon: "happy" },
  ];

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
      await createPost(content, channelId || myChannels[0].id, postType);
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
        placeholder={
          postType === "status"
            ? "What's your status?"
            : postType === "location"
            ? "Share your location..."
            : "What's on your mind?"
        }
        placeholderTextColor={colors.textTertiary}
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={LIMITS.POST_CONTENT_MAX}
        autoFocus
      />

      <View style={styles.postTypeSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {postTypeOptions.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.postTypeOption,
                postType === option.type && styles.postTypeOptionActive,
              ]}
              onPress={() => setPostType(option.type)}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={
                  postType === option.type
                    ? colors.surface
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.postTypeText,
                  postType === option.type && styles.postTypeTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
  postTypeSelector: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  postTypeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  postTypeOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  postTypeText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  postTypeTextActive: {
    color: colors.surface,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
