import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, Platform, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows, Colors } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  fullWidth?: boolean;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "medium",
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const handlePress = () => {
    if (!disabled && !loading && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (!disabled && !loading) {
      onPress?.();
    }
  };

  const getBackgroundColor = () => {
    if (disabled) {
      return isDark ? Colors.dark.backgroundTertiary : Colors.light.backgroundTertiary;
    }
    switch (variant) {
      case "primary":
        return "#000000";
      case "secondary":
        return theme.accent;
      case "outline":
      case "ghost":
        return "transparent";
      default:
        return "#000000";
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.textTertiary;
    }
    switch (variant) {
      case "primary":
        return "#FFFFFF";
      case "secondary":
        return isDark ? "#000000" : "#FFFFFF";
      case "outline":
      case "ghost":
        return theme.text;
      default:
        return "#FFFFFF";
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") {
      return disabled ? theme.textTertiary : theme.text;
    }
    return "transparent";
  };

  const getHeight = () => {
    switch (size) {
      case "small":
        return 40;
      case "medium":
        return 52;
      case "large":
        return 56;
      default:
        return 52;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return Spacing.lg;
      case "medium":
        return Spacing.xl;
      case "large":
        return Spacing["2xl"];
      default:
        return Spacing.xl;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getHeight(),
          paddingHorizontal: getPadding(),
          opacity: disabled ? 0.5 : 1,
        },
        variant === "outline" && styles.outlineButton,
        variant !== "ghost" && variant !== "outline" && Shadows.small,
        fullWidth && styles.fullWidth,
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <ThemedText
          type="button"
          style={[styles.buttonText, { color: getTextColor() }]}
        >
          {children}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  outlineButton: {
    borderWidth: 1.5,
  },
  buttonText: {
    textAlign: "center",
  },
  fullWidth: {
    width: "100%",
  },
});
