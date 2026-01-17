import React from "react";
import { StyleSheet, View, Image, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface RideHistoryData {
  id: string;
  date: string;
  pickupAddress: string;
  destinationAddress: string;
  fare: string;
  driverName: string;
  driverAvatar?: string;
  status: string;
}

interface RideHistoryCardProps {
  ride: RideHistoryData;
  onPress?: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function RideHistoryCard({ ride, onPress }: RideHistoryCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        Shadows.small,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {ride.date}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  ride.status === "completed"
                    ? theme.success
                    : ride.status === "cancelled"
                    ? theme.error
                    : theme.accent,
              },
            ]}
          >
            <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="h3">{ride.fare}</ThemedText>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
          <View style={[styles.routeLine, { backgroundColor: theme.textTertiary }]} />
          <View style={[styles.routeDot, { backgroundColor: theme.text }]} />
        </View>
        <View style={styles.addressContainer}>
          <ThemedText type="small" numberOfLines={1}>
            {ride.pickupAddress}
          </ThemedText>
          <ThemedText type="small" numberOfLines={1}>
            {ride.destinationAddress}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.driverSection, { borderTopColor: theme.backgroundSecondary }]}>
        <View style={styles.driverInfo}>
          <Image
            source={
              ride.driverAvatar
                ? { uri: ride.driverAvatar }
                : require("../../assets/images/avatar-default.png")
            }
            style={styles.driverAvatar}
          />
          <ThemedText type="small">{ride.driverName}</ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textTertiary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  routeContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  routeIndicator: {
    alignItems: "center",
    paddingVertical: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  addressContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 0,
    gap: Spacing.md,
  },
  driverSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
