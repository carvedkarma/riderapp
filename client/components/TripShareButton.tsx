import React from "react";
import { StyleSheet, Pressable, Platform, Share } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface TripShareButtonProps {
  rideId: string;
  driverName: string;
  eta: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TripShareButton({
  rideId,
  driverName,
  eta,
}: TripShareButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await Share.share({
        message: `I'm on my way! My driver ${driverName} will arrive in ${eta}. Track my trip: ridex://track/${rideId}`,
        title: "Share my RideX trip",
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  return (
    <AnimatedPressable
      onPress={handleShare}
      onPressIn={() => {
        scale.value = withSpring(0.95);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        Shadows.small,
        animatedStyle,
      ]}
    >
      <Feather name="share-2" size={18} color={theme.accent} />
      <ThemedText type="small" style={{ color: theme.accent }}>
        Share trip
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
});
