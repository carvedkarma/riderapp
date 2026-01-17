import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { DriverStackParamList } from "@/navigation/DriverStackNavigator";

type DriverTripCompleteScreenNavigationProp = NativeStackNavigationProp<
  DriverStackParamList,
  "DriverTripComplete"
>;

type DriverTripCompleteScreenRouteProp = RouteProp<
  DriverStackParamList,
  "DriverTripComplete"
>;

interface Props {
  navigation: DriverTripCompleteScreenNavigationProp;
  route: DriverTripCompleteScreenRouteProp;
}

export default function DriverTripCompleteScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const earnings = parseFloat(route.params.earnings) || 18.50;
  const platformFee = earnings * 0.2;
  const netEarnings = earnings - platformFee;

  React.useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleContinue = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.replace("DriverHome");
  };

  const handleViewEarnings = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    navigation.replace("DriverEarnings");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={["rgba(48, 209, 88, 0.15)", "transparent"]}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing["4xl"] }]}>
        <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.successIcon}>
          <LinearGradient
            colors={[theme.success, "#1B8A3E"]}
            style={styles.successGradient}
          >
            <Feather name="check" size={48} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <ThemedText type="h1" style={styles.title}>
            Trip Complete!
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Great job! Here's your earnings summary
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.earningsCard}>
          <LinearGradient
            colors={["#1C1C1E", "#0A0A0A"]}
            style={styles.earningsGradient}
          >
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              YOU EARNED
            </ThemedText>
            <ThemedText type="hero" style={[styles.earningsAmount, { color: theme.success }]}>
              ${netEarnings.toFixed(2)}
            </ThemedText>

            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>Trip fare</ThemedText>
                <ThemedText type="body">${earnings.toFixed(2)}</ThemedText>
              </View>
              <View style={styles.breakdownRow}>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>Platform fee (20%)</ThemedText>
                <ThemedText type="body" style={{ color: theme.error }}>-${platformFee.toFixed(2)}</ThemedText>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownTotal, { borderTopColor: theme.backgroundTertiary }]}>
                <ThemedText type="h4">Your earnings</ThemedText>
                <ThemedText type="h4" style={{ color: theme.success }}>${netEarnings.toFixed(2)}</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="clock" size={20} color={theme.accent} />
            <ThemedText type="h3">15 min</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Duration</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="navigation" size={20} color={theme.accent} />
            <ThemedText type="h3">3.2 mi</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Distance</ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(500)} style={styles.riderFeedback}>
          <View style={[styles.feedbackCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="star" size={18} color={theme.accent} />
            <ThemedText type="body">Sarah rated you 5 stars!</ThemedText>
          </View>
        </Animated.View>
      </View>

      <Animated.View 
        entering={FadeInDown.delay(600)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Button onPress={handleContinue} fullWidth>
          Continue Driving
        </Button>
        <Button variant="ghost" onPress={handleViewEarnings}>
          View Earnings
        </Button>
      </Animated.View>
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
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: Spacing["2xl"],
  },
  successGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  earningsCard: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  earningsGradient: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  earningsAmount: {
    fontSize: 48,
    marginVertical: Spacing.md,
  },
  breakdown: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownTotal: {
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  riderFeedback: {
    width: "100%",
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
});
