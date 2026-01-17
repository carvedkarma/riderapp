import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface FareLockTimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
}

export function FareLockTimer({
  initialSeconds = 120,
  onExpire,
}: FareLockTimerProps) {
  const { theme } = useTheme();
  const [seconds, setSeconds] = useState(initialSeconds);
  const progress = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    progress.value = withTiming(seconds / initialSeconds, { duration: 1000 });
  }, [seconds]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getColor = () => {
    if (seconds <= 30) return theme.error;
    if (seconds <= 60) return theme.warning;
    return theme.success;
  };

  return (
    <Animated.View
      entering={FadeIn}
      style={[styles.container, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.header}>
        <View style={styles.lockInfo}>
          <Feather name="lock" size={14} color={getColor()} />
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Fare locked for
          </ThemedText>
        </View>
        <ThemedText type="h4" style={{ color: getColor() }}>
          {formatTime(seconds)}
        </ThemedText>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: theme.backgroundTertiary }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { backgroundColor: getColor() },
            progressStyle,
          ]}
        />
      </View>

      <View style={styles.confidenceRow}>
        <Feather name="shield" size={12} color={theme.accent} />
        <ThemedText type="caption" style={{ color: theme.accent }}>
          98% fare confidence
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
