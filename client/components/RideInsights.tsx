import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface RideInsightsProps {
  monthlySpend: number;
  totalRides: number;
  timeSaved: number;
  favoriteTime: string;
}

export function RideInsights({
  monthlySpend,
  totalRides,
  timeSaved,
  favoriteTime,
}: RideInsightsProps) {
  const { theme } = useTheme();

  const insights = [
    {
      icon: "dollar-sign" as const,
      label: "This month",
      value: `$${monthlySpend}`,
      color: theme.accent,
    },
    {
      icon: "navigation" as const,
      label: "Total rides",
      value: `${totalRides}`,
      color: theme.mapAccent,
    },
    {
      icon: "clock" as const,
      label: "Time saved",
      value: `${timeSaved}h`,
      color: theme.success,
    },
  ];

  return (
    <Animated.View entering={FadeInUp.delay(100).springify()}>
      <GlassCard style={styles.container}>
        <View style={styles.header}>
          <Feather name="bar-chart-2" size={20} color={theme.accent} />
          <ThemedText type="h4">Your Ride Insights</ThemedText>
        </View>

        <View style={styles.statsGrid}>
          {insights.map((insight, index) => (
            <View key={index} style={styles.statItem}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${insight.color}20` },
                ]}
              >
                <Feather name={insight.icon} size={18} color={insight.color} />
              </View>
              <ThemedText type="h3" style={{ color: insight.color }}>
                {insight.value}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {insight.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.suggestion, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="zap" size={16} color={theme.accent} />
          <View style={styles.suggestionText}>
            <ThemedText type="small">Best time to book</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {favoriteTime} - usually 20% cheaper
            </ThemedText>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  suggestionText: {
    flex: 1,
    gap: 2,
  },
});
