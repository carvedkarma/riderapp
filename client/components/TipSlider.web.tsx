import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TipSliderProps {
  driverName: string;
  baseFare: number;
  onTipChange?: (tip: number) => void;
}

const TIP_PRESETS = [0, 5, 10, 15, 20];

export function TipSlider({ driverName, baseFare, onTipChange }: TipSliderProps) {
  const { theme } = useTheme();
  const [tip, setTip] = useState(0);

  const handleTipChange = useCallback((value: number) => {
    const roundedTip = Math.round(value);
    setTip(roundedTip);
    onTipChange?.(roundedTip);
  }, [onTipChange]);

  const handlePresetPress = useCallback((preset: number) => {
    setTip(preset);
    onTipChange?.(preset);
  }, [onTipChange]);

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

      <View style={styles.presetsContainer}>
        {TIP_PRESETS.map((preset) => (
          <Pressable
            key={preset}
            onPress={() => handlePresetPress(preset)}
            style={[
              styles.presetButton,
              {
                backgroundColor:
                  tip === preset ? theme.accent : theme.backgroundSecondary,
                borderColor: tip === preset ? theme.accent : theme.backgroundTertiary,
              },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: tip === preset ? "#FFFFFF" : theme.text,
                fontWeight: tip === preset ? "700" : "400",
              }}
            >
              {preset === 0 ? "No tip" : `$${preset}`}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.sliderContainer}>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={tip}
          onChange={(e) => handleTipChange(parseInt(e.target.value, 10))}
          style={{
            width: "100%",
            height: 8,
            borderRadius: 4,
            background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${(tip / 20) * 100}%, ${theme.backgroundTertiary} ${(tip / 20) * 100}%, ${theme.backgroundTertiary} 100%)`,
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
            outline: "none",
          }}
        />
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
  presetsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  presetButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sliderContainer: {
    paddingHorizontal: Spacing.xs,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
