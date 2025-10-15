import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useChannels } from "../../hooks/useChannels";
import { colors, spacing, typography } from "../../theme";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Ionicons } from "@expo/vector-icons";

interface EditChannelScreenProps {
  route: any;
  navigation: any;
}

export const EditChannelScreen = ({
  route,
  navigation,
}: EditChannelScreenProps) => {
  const { channelId } = route.params;
  const { myChannels, updateChannel, deleteChannel } = useChannels();

  const [channelName, setChannelName] = useState("");
  const [channelHandle, setChannelHandle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const channel = myChannels.find((c) => c.id === channelId);

  useEffect(() => {
    if (channel) {
      setChannelName(channel.channel_name || "");
      setChannelHandle(channel.channel_handle || "");
      setDescription(channel.description || "");
      setCategory(channel.category || "");
      setIsPrivate(channel.is_private || false);
    }
  }, [channel]);

  const handleUpdate = async () => {
    if (!channelName.trim() || !channelHandle.trim()) {
      Alert.alert("Error", "Channel name and handle are required");
      return;
    }

    setLoading(true);
    try {
      await updateChannel(channelId, {
        channelName: channelName.trim(),
        channelHandle: channelHandle.trim(),
        description: description.trim(),
        category: category.trim(),
        isPrivate,
      });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update channel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Channel",
      "Are you sure you want to delete this channel? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChannel(channelId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete channel");
            }
          },
        },
      ]
    );
  };

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Channel not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Channel</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Channel Name"
          value={channelName}
          onChangeText={setChannelName}
          placeholder="Enter channel name"
        />

        <Input
          label="Channel Handle"
          value={channelHandle}
          onChangeText={setChannelHandle}
          placeholder="Enter channel handle"
          autoCapitalize="none"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter channel description"
          multiline
          numberOfLines={3}
        />

        <Input
          label="Category"
          value={category}
          onChangeText={setCategory}
          placeholder="Enter category (e.g., Technology, Sports)"
        />

        <TouchableOpacity
          style={styles.privacyToggle}
          onPress={() => setIsPrivate(!isPrivate)}
        >
          <View style={[styles.checkbox, isPrivate && styles.checkboxChecked]}>
            {isPrivate && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </View>
          <Text style={styles.privacyText}>Private Channel</Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <Button
            title="Update Channel"
            onPress={handleUpdate}
            loading={loading}
          />
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color={colors.error} />
          <Text style={styles.deleteText}>Delete Channel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: "center",
  },
  form: {
    padding: spacing.lg,
  },
  privacyToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  privacyText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
  },
  deleteText: {
    color: colors.error,
    marginLeft: spacing.sm,
    ...typography.body,
    fontWeight: "600",
  },
  errorText: {
    ...typography.h2,
    color: colors.error,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
