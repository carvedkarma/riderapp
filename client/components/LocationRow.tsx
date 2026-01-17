import React from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
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
import { Spacing, BorderRadius } from "@/constants/theme";

interface LocationRowProps {
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
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

export function LocationRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
}: LocationRowProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: `rgba(0,0,0,${backgroundColor.value})`,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
    backgroundColor.value = withSpring(0.02, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
    backgroundColor.value = withSpring(0, springConfig);
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconColor ? `${iconColor}20` : theme.backgroundSecondary },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={iconColor || theme.textSecondary}
        />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="body" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary }}
            numberOfLines={1}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textTertiary} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});
