import React, { useState } from "react";
import { StyleSheet, View, Pressable, Platform, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface RidePreferencesProps {
  onPreferencesChange?: (preferences: RidePreferencesState) => void;
}

interface RidePreferencesState {
  quietRide: boolean;
  musicAllowed: boolean;
  temperature: "cool" | "normal" | "warm";
}

export function RidePreferences({ onPreferencesChange }: RidePreferencesProps) {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState<RidePreferencesState>({
    quietRide: false,
    musicAllowed: true,
    temperature: "normal",
  });

  const handleToggle = (key: keyof RidePreferencesState, value: any) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  const temperatureOptions: { key: RidePreferencesState["temperature"]; icon: keyof typeof Feather.glyphMap; label: string }[] = [
    { key: "cool", icon: "wind", label: "Cool" },
    { key: "normal", icon: "thermometer", label: "Normal" },
    { key: "warm", icon: "sun", label: "Warm" },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <GlassCard style={styles.container}>
        <ThemedText type="h4" style={styles.title}>
          Ride Preferences
        </ThemedText>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Feather name="volume-x" size={20} color={theme.text} />
            <View>
              <ThemedText type="small">Quiet Ride</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Driver won't chat
              </ThemedText>
            </View>
          </View>
          <Switch
            value={preferences.quietRide}
            onValueChange={(value) => handleToggle("quietRide", value)}
            trackColor={{ false: theme.backgroundTertiary, true: theme.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.backgroundSecondary }]} />

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Feather name="music" size={20} color={theme.text} />
            <View>
              <ThemedText type="small">Music Allowed</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Driver may play music
              </ThemedText>
            </View>
          </View>
          <Switch
            value={preferences.musicAllowed}
            onValueChange={(value) => handleToggle("musicAllowed", value)}
            trackColor={{ false: theme.backgroundTertiary, true: theme.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.backgroundSecondary }]} />

        <View style={styles.temperatureSection}>
          <View style={styles.preferenceInfo}>
            <Feather name="thermometer" size={20} color={theme.text} />
            <ThemedText type="small">Temperature</ThemedText>
          </View>
          <View style={styles.temperatureOptions}>
            {temperatureOptions.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => handleToggle("temperature", option.key)}
                style={[
                  styles.temperatureButton,
                  {
                    backgroundColor:
                      preferences.temperature === option.key
                        ? theme.accentLight
                        : theme.backgroundSecondary,
                    borderColor:
                      preferences.temperature === option.key
                        ? theme.accent
                        : "transparent",
                  },
                ]}
              >
                <Feather
                  name={option.icon}
                  size={16}
                  color={
                    preferences.temperature === option.key
                      ? theme.accent
                      : theme.textSecondary
                  }
                />
                <ThemedText
                  type="caption"
                  style={{
                    color:
                      preferences.temperature === option.key
                        ? theme.accent
                        : theme.textSecondary,
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
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
  title: {
    marginBottom: Spacing.xs,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  preferenceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  divider: {
    height: 1,
  },
  temperatureSection: {
    gap: Spacing.md,
  },
  temperatureOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  temperatureButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
  },
});
