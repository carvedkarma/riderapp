import React, { useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InsightPanelProps {
  onPress?: () => void;
}

export function InsightPanel({ onPress }: InsightPanelProps) {
  const { theme } = useTheme();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(300).springify()}>
      <GlassCard onPress={onPress} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.demandIndicator}>
            <Animated.View
              style={[
                styles.demandDot,
                { backgroundColor: theme.success },
                pulseStyle,
              ]}
            />
            <ThemedText type="small" style={{ color: theme.success }}>
              Low demand
            </ThemedText>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.accentLight }]}>
            <Feather name="trending-down" size={12} color={theme.accent} />
            <ThemedText type="caption" style={{ color: theme.accent }}>
              -15%
            </ThemedText>
          </View>
        </View>

        <View style={styles.insights}>
          <View style={styles.insightItem}>
            <Feather name="clock" size={14} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Best time to book
            </ThemedText>
          </View>
          <View style={styles.insightItem}>
            <Feather name="users" size={14} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              12 drivers nearby
            </ThemedText>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  demandIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  demandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  insights: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
