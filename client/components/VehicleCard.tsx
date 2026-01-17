import React from "react";
import { StyleSheet, View, Image, Pressable, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

export interface VehicleTier {
  id: string;
  name: string;
  description: string;
  eta: string;
  price: string;
  capacity: number;
  image: any;
}

interface VehicleCardProps {
  vehicle: VehicleTier;
  selected?: boolean;
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

export function VehicleCard({ vehicle, selected = false, onPress }: VehicleCardProps) {
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
        {
          backgroundColor: selected ? theme.accentLight : theme.backgroundDefault,
          borderColor: selected ? theme.accent : "transparent",
        },
        selected && Shadows.small,
        animatedStyle,
      ]}
    >
      <Image source={vehicle.image} style={styles.vehicleImage} resizeMode="contain" />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <ThemedText type="h3">{vehicle.name}</ThemedText>
          <View style={styles.capacityBadge}>
            <Feather name="user" size={12} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {vehicle.capacity}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {vehicle.description}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.accent }}>
          {vehicle.eta}
        </ThemedText>
      </View>
      <View style={styles.priceContainer}>
        <ThemedText type="h3">{vehicle.price}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    gap: Spacing.md,
  },
  vehicleImage: {
    width: 80,
    height: 48,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  capacityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
});
