import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image, Pressable, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeInUp,
  FadeInDown,
  ZoomIn,
} from "react-native-reanimated";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { TipSlider } from "@/components/TipSlider";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type RideCompleteScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RideComplete"
>;

type RideCompleteScreenRouteProp = RouteProp<RootStackParamList, "RideComplete">;

interface Props {
  navigation: RideCompleteScreenNavigationProp;
  route: RideCompleteScreenRouteProp;
}

export default function RideCompleteScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { fare, driver } = route.params;

  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkScale = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withDelay(300, withSpring(1, { damping: 12 }));
    if (Platform.OS !== "web") {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    }
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleRating = (stars: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRating(stars);
  };

  const handleSubmit = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.popToTop();
    }, 1000);
  };

  const baseFare = parseFloat(fare.replace("$", ""));
  const total = baseFare + tip;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView 
        contentContainerStyle={[
          styles.content, 
          { paddingTop: insets.top + Spacing["3xl"], paddingBottom: Spacing["3xl"] }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Animated.View style={[styles.checkmark, { backgroundColor: theme.success }, checkStyle]}>
            <Feather name="check" size={32} color="#FFFFFF" />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <ThemedText type="hero" style={styles.title}>
              Ride Complete
            </ThemedText>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(500).springify()}>
            <ThemedText type="h1" style={{ color: theme.accent }}>
              ${total.toFixed(2)}
            </ThemedText>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <GlassCard style={styles.driverCard}>
            <View style={styles.driverRow}>
              <Image
                source={require("../../assets/images/avatar-default.png")}
                style={styles.driverAvatar}
              />
              <View style={styles.driverInfo}>
                <ThemedText type="h3">{driver.name}</ThemedText>
                <View style={styles.vehicleInfo}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {driver.vehicleColor} {driver.vehicleMake} {driver.vehicleModel}
                  </ThemedText>
                </View>
              </View>
              <View style={[styles.ratingBadge, { backgroundColor: theme.accentLight }]}>
                <Feather name="star" size={12} color={theme.accent} />
                <ThemedText type="h4" style={{ color: theme.accent }}>
                  {driver.rating}
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(700).springify()}
          style={styles.ratingSection}
        >
          <ThemedText type="h3" style={styles.sectionTitle}>
            How was your ride?
          </ThemedText>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star, index) => (
              <Animated.View
                key={star}
                entering={ZoomIn.delay(800 + index * 50).springify()}
              >
                <Pressable
                  onPress={() => handleRating(star)}
                  style={styles.starButton}
                >
                  <Feather
                    name={star <= rating ? "star" : "star"}
                    size={40}
                    color={star <= rating ? theme.accent : theme.textTertiary}
                  />
                </Pressable>
              </Animated.View>
            ))}
          </View>
          {rating > 0 ? (
            <Animated.View entering={FadeInUp.springify()}>
              <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
                {rating === 5 ? "Excellent!" : rating >= 4 ? "Great ride!" : rating >= 3 ? "Good" : "We're sorry to hear that"}
              </ThemedText>
            </Animated.View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(900).springify()}>
          <TipSlider
            driverName={driver.name}
            baseFare={baseFare}
            onTipChange={setTip}
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(1000).springify()}
          style={[styles.fareBreakdown, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.fareRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Ride fare
            </ThemedText>
            <ThemedText type="small">{fare}</ThemedText>
          </View>
          {tip > 0 ? (
            <View style={styles.fareRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Tip
              </ThemedText>
              <ThemedText type="small">${tip.toFixed(2)}</ThemedText>
            </View>
          ) : null}
          <View style={[styles.fareDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <View style={styles.fareRow}>
            <ThemedText type="h4">Total</ThemedText>
            <ThemedText type="h3" style={{ color: theme.accent }}>
              ${total.toFixed(2)}
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={rating === 0}
          fullWidth
        >
          Done
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  checkmark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.large,
  },
  title: {
    textAlign: "center",
  },
  driverCard: {
    padding: Spacing.lg,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  ratingSection: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  sectionTitle: {
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  fareBreakdown: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fareDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});
