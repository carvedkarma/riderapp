import React from "react";
import { StyleSheet, View, Image, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface DriverInfo {
  name: string;
  rating: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  avatarUrl?: string;
  isVerified?: boolean;
  totalRides?: number;
}

interface DriverCardProps {
  driver: DriverInfo;
  eta?: string;
  onCallPress?: () => void;
  onMessagePress?: () => void;
}

export function DriverCard({
  driver,
  eta,
  onCallPress,
  onMessagePress,
}: DriverCardProps) {
  const { theme } = useTheme();

  const handleAction = (action: () => void | undefined) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action?.();
  };

  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.driverInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                driver.avatarUrl
                  ? { uri: driver.avatarUrl }
                  : require("../../assets/images/avatar-default.png")
              }
              style={styles.avatar}
            />
            {driver.isVerified ? (
              <View style={[styles.verifiedBadge, { backgroundColor: theme.success }]}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            ) : null}
          </View>
          <View style={styles.nameContainer}>
            <ThemedText type="h3">{driver.name}</ThemedText>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={14} color={theme.accent} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {driver.rating}
              </ThemedText>
              {driver.totalRides ? (
                <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                  ({driver.totalRides} rides)
                </ThemedText>
              ) : null}
            </View>
          </View>
        </View>
        {eta ? (
          <View style={styles.etaContainer}>
            <ThemedText type="h2" style={{ color: theme.accent }}>
              {eta}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              away
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={[styles.vehicleInfo, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.vehicleDetails}>
          <ThemedText type="body">
            {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
          </ThemedText>
          <View style={[styles.plateBadge, { backgroundColor: theme.backgroundTertiary }]}>
            <ThemedText type="h4">{driver.vehiclePlate}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => handleAction(onCallPress!)}
        >
          <Feather name="phone" size={20} color={theme.text} />
          <ThemedText type="small">Call</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
          onPress={() => handleAction(onMessagePress!)}
        >
          <Feather name="message-circle" size={20} color={theme.text} />
          <ThemedText type="small">Message</ThemedText>
        </Pressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameContainer: {
    gap: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  etaContainer: {
    alignItems: "flex-end",
  },
  vehicleInfo: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  vehicleDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  plateBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
});
