import React from "react";
import { StyleSheet, View, Pressable, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

type RoleSelectorScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RoleSelector"
>;

interface Props {
  navigation: RoleSelectorScreenNavigationProp;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RoleCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  gradient: string[];
  onPress: () => void;
  delay: number;
}

function RoleCard({ title, subtitle, icon, gradient, onPress, delay }: RoleCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.roleCard, animatedStyle]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.roleGradient}
        >
          <View style={styles.roleIconContainer}>
            <Feather name={icon} size={32} color="#FFFFFF" />
          </View>
          <View style={styles.roleContent}>
            <ThemedText type="h2" style={styles.roleTitle}>
              {title}
            </ThemedText>
            <ThemedText type="body" style={styles.roleSubtitle}>
              {subtitle}
            </ThemedText>
          </View>
          <View style={styles.roleArrow}>
            <Feather name="arrow-right" size={24} color="rgba(255,255,255,0.7)" />
          </View>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function RoleSelectorScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleRiderPress = () => {
    navigation.replace("Dashboard");
  };

  const handleDriverPress = () => {
    navigation.replace("DriverOnboarding");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={["rgba(212, 184, 122, 0.1)", "transparent"]}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing["4xl"] }]}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: theme.accent }]}>
            <Feather name="navigation" size={28} color="#000000" />
          </View>
          <ThemedText type="h1" style={styles.logoText}>RideX</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <ThemedText type="h2" style={styles.welcomeTitle}>
            Welcome to RideX
          </ThemedText>
          <ThemedText type="body" style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
            Choose how you want to use the app
          </ThemedText>
        </Animated.View>

        <View style={styles.rolesContainer}>
          <RoleCard
            title="Ride"
            subtitle="Book rides and travel anywhere"
            icon="navigation"
            gradient={["#4A90D9", "#2E5A8E"]}
            onPress={handleRiderPress}
            delay={300}
          />

          <RoleCard
            title="Drive"
            subtitle="Earn money on your schedule"
            icon="truck"
            gradient={[theme.accent, "#8B7355"]}
            onPress={handleDriverPress}
            delay={400}
          />
        </View>

        <Animated.View entering={FadeInUp.delay(500)} style={styles.footer}>
          <ThemedText type="caption" style={{ color: theme.textTertiary, textAlign: "center" }}>
            You can switch between modes anytime
          </ThemedText>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing["4xl"],
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  rolesContainer: {
    gap: Spacing.lg,
  },
  roleCard: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  roleGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  roleContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  roleTitle: {
    color: "#FFFFFF",
  },
  roleSubtitle: {
    color: "rgba(255,255,255,0.8)",
  },
  roleArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: Spacing["2xl"],
  },
});
