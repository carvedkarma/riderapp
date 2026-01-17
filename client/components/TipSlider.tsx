import React, { useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TipSliderProps {
  driverName: string;
  baseFare: number;
  onTipChange?: (tip: number) => void;
}

const TIP_PRESETS = [0, 2, 5, 10, 15, 20];

export function TipSlider({ driverName, baseFare, onTipChange }: TipSliderProps) {
  const { theme } = useTheme();
  const [tip, setTip] = useState(0);

  const handleTipChange = (value: number) => {
    const roundedTip = Math.round(value);
    if (roundedTip !== tip) {
      setTip(roundedTip);
      onTipChange?.(roundedTip);
      if (Platform.OS !== "web" && roundedTip % 5 === 0 && roundedTip > 0) {
        Haptics.selectionAsync();
      }
    }
  };

  const percentage = baseFare > 0 ? Math.round((tip / baseFare) * 100) : 0;

  return (
    <Animated.View
      entering={FadeInUp.delay(300).springify()}
      style={[styles.container, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Feather name="heart" size={20} color={theme.accent} />
        </View>
        <View style={styles.headerText}>
          <ThemedText type="h4">Add a tip for {driverName.split(" ")[0]}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            100% goes to your driver
          </ThemedText>
        </View>
      </View>

      <View style={styles.tipDisplay}>
        <ThemedText type="hero" style={{ color: theme.accent }}>
          ${tip}
        </ThemedText>
        {percentage > 0 ? (
          <View style={[styles.percentageBadge, { backgroundColor: theme.accentLight }]}>
            <ThemedText type="caption" style={{ color: theme.accent }}>
              {percentage}%
            </ThemedText>
          </View>
        ) : null}
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={20}
        step={1}
        value={tip}
        onValueChange={handleTipChange}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor={theme.backgroundTertiary}
        thumbTintColor={theme.accent}
      />

      <View style={styles.presets}>
        {TIP_PRESETS.filter((t) => t > 0).map((preset) => (
          <View
            key={preset}
            style={[
              styles.presetDot,
              {
                backgroundColor:
                  tip >= preset ? theme.accent : theme.backgroundTertiary,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.labels}>
        <ThemedText type="caption" style={{ color: theme.textTertiary }}>
          No tip
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textTertiary }}>
          $20
        </ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(201, 170, 112, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  tipDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  percentageBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  presets: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    marginTop: -Spacing.md,
  },
  presetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
