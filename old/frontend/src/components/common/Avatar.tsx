import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme";

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar = ({ name, size = 40 }: AvatarProps) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFF",
    fontWeight: "600",
  },
});
