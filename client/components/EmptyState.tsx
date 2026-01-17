import React from "react";
import { StyleSheet, View, Image, ImageSourcePropType } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface EmptyStateProps {
  image?: ImageSourcePropType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  image,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={image} style={styles.image} resizeMode="contain" />
      ) : null}
      <View style={styles.textContainer}>
        <ThemedText type="h2" style={styles.title}>
          {title}
        </ThemedText>
        {description ? (
          <ThemedText
            type="body"
            style={[styles.description, { color: theme.textSecondary }]}
          >
            {description}
          </ThemedText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button onPress={onAction} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    gap: Spacing["2xl"],
  },
  image: {
    width: 200,
    height: 200,
    opacity: 0.9,
  },
  textContainer: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
  },
});
