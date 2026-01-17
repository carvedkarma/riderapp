import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DriverEarningsBadgeProps {
  earnings: string;
  compact?: boolean;
}

export function DriverEarningsBadge({
  earnings,
  compact = false,
}: DriverEarningsBadgeProps) {
  const { theme } = useTheme();

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: theme.success + "20" }]}>
        <Feather name="dollar-sign" size={12} color={theme.success} />
        <ThemedText type="caption" style={{ color: theme.success }}>
          {earnings}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.success + "20" }]}>
        <Feather name="trending-up" size={16} color={theme.success} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Driver earns
        </ThemedText>
        <ThemedText type="h4" style={{ color: theme.success }}>
          {earnings}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    gap: 2,
  },
  compactBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
});
