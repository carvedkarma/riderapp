import React, { useState } from "react";
import { StyleSheet, View, Image, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
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

const TIP_OPTIONS = [
  { id: "none", label: "No tip", amount: 0 },
  { id: "small", label: "$2", amount: 2 },
  { id: "medium", label: "$5", amount: 5 },
  { id: "large", label: "$10", amount: 10 },
];

export default function RideCompleteScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { fare, driver } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (stars: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRating(stars);
  };

  const handleTipSelect = (tipId: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedTip(tipId);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing["3xl"] }]}>
        <View style={styles.header}>
          <View style={[styles.checkmark, { backgroundColor: theme.success }]}>
            <Feather name="check" size={32} color="#FFFFFF" />
          </View>
          <ThemedText type="hero" style={styles.title}>
            Ride Complete
          </ThemedText>
          <ThemedText type="h1" style={{ color: theme.accent }}>
            {fare}
          </ThemedText>
        </View>

        <GlassCard style={styles.driverCard}>
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
        </GlassCard>

        <View style={styles.ratingSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            How was your ride?
          </ThemedText>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleRating(star)}
                style={styles.starButton}
              >
                <Feather
                  name="star"
                  size={40}
                  color={star <= rating ? theme.accent : theme.textTertiary}
                  style={star <= rating ? styles.filledStar : undefined}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.tipSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Add a tip for {driver.name.split(" ")[0]}
          </ThemedText>
          <View style={styles.tipOptions}>
            {TIP_OPTIONS.map((tip) => (
              <Pressable
                key={tip.id}
                onPress={() => handleTipSelect(tip.id)}
                style={[
                  styles.tipButton,
                  {
                    backgroundColor:
                      selectedTip === tip.id
                        ? theme.accentLight
                        : theme.backgroundDefault,
                    borderColor:
                      selectedTip === tip.id ? theme.accent : "transparent",
                  },
                ]}
              >
                <ThemedText
                  type={selectedTip === tip.id ? "h4" : "body"}
                  style={{
                    color: selectedTip === tip.id ? theme.accent : theme.text,
                  }}
                >
                  {tip.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

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
    flex: 1,
    paddingHorizontal: Spacing.xl,
    gap: Spacing["2xl"],
  },
  header: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  checkmark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  title: {
    textAlign: "center",
  },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
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
  ratingSection: {
    alignItems: "center",
    gap: Spacing.lg,
  },
  sectionTitle: {
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  starButton: {
    padding: Spacing.xs,
  },
  filledStar: {
    textShadowColor: "rgba(201, 170, 112, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tipSection: {
    gap: Spacing.lg,
  },
  tipOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tipButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
});
