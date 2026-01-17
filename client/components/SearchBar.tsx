import React from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface SearchBarProps {
  placeholder?: string;
  onPress?: () => void;
}

export function SearchBar({ placeholder = "Where to?", onPress }: SearchBarProps) {
  const { theme, isDark } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.container, Shadows.medium]}>
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.backgroundDefault },
          ]}
        />
      )}
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.accent }]}>
          <Feather name="search" size={18} color="#FFFFFF" />
        </View>
        <ThemedText type="body" style={styles.placeholder}>
          {placeholder}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    flex: 1,
  },
});
