import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

import { MapViewWrapper } from "@/components/MapViewWrapper";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

type DriverActiveTripScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverActiveTrip"
>;

type DriverActiveTripScreenRouteProp = RouteProp<
  RootStackParamList,
  "DriverActiveTrip"
>;

interface Props {
  navigation: DriverActiveTripScreenNavigationProp;
  route: DriverActiveTripScreenRouteProp;
}

type TripState = "navigating" | "arrived" | "started" | "completing";

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const RIDER_INFO = {
  name: "Sarah M.",
  rating: 4.9,
  pickupAddress: "123 Main Street",
  dropoffAddress: "456 Market Avenue",
  estimatedTime: 15,
  estimatedEarnings: 18.50,
};

export default function DriverActiveTripScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  const [tripState, setTripState] = useState<TripState>("navigating");
  const [eta, setEta] = useState(5);
  const progress = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tripState === "navigating") {
      progress.value = withTiming(0.25, { duration: 500 });
    } else if (tripState === "arrived") {
      progress.value = withTiming(0.5, { duration: 500 });
    } else if (tripState === "started") {
      progress.value = withTiming(0.75, { duration: 500 });
    } else if (tripState === "completing") {
      progress.value = withTiming(1, { duration: 500 });
    }
  }, [tripState]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleArrived = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setTripState("arrived");
  };

  const handleStartTrip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setTripState("started");
  };

  const handleCompleteTrip = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    navigation.replace("DriverTripComplete", {
      tripId: route.params.tripId,
      earnings: RIDER_INFO.estimatedEarnings.toString(),
    });
  };

  const handleCancel = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.goBack();
  };

  const getActionButton = () => {
    switch (tripState) {
      case "navigating":
        return { label: "I've Arrived", action: handleArrived, color: theme.accent };
      case "arrived":
        return { label: "Start Trip", action: handleStartTrip, color: theme.success };
      case "started":
        return { label: "Complete Trip", action: handleCompleteTrip, color: theme.success };
      default:
        return { label: "Continue", action: () => {}, color: theme.accent };
    }
  };

  const actionButton = getActionButton();

  const getStatusText = () => {
    switch (tripState) {
      case "navigating":
        return "Navigate to pickup";
      case "arrived":
        return "Waiting for rider";
      case "started":
        return "Trip in progress";
      default:
        return "";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <MapViewWrapper
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userInterfaceStyle="dark"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          onPress={handleCancel}
          style={[styles.backButton, { backgroundColor: "rgba(28, 28, 30, 0.9)" }]}
        >
          <Feather name="x" size={20} color={theme.text} />
        </Pressable>

        <View style={[styles.statusBadge, { backgroundColor: theme.accent }]}>
          <ThemedText type="caption" style={{ color: "#000000", fontWeight: "600" }}>
            {getStatusText()}
          </ThemedText>
        </View>

        <View style={styles.placeholder} />
      </View>

      <Animated.View
        entering={SlideInUp.delay(200).springify()}
        style={styles.bottomSheet}
      >
        <LinearGradient
          colors={["#1C1C1E", "#0A0A0A"]}
          style={[styles.bottomSheetGradient, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: theme.backgroundTertiary }]}>
              <Animated.View style={[styles.progressBar, { backgroundColor: theme.accent }, progressStyle]} />
            </View>
            <View style={styles.progressSteps}>
              {["Navigate", "Arrived", "Start", "Complete"].map((step, index) => (
                <View key={step} style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor:
                          index <= ["navigating", "arrived", "started", "completing"].indexOf(tripState)
                            ? theme.accent
                            : theme.backgroundTertiary,
                      },
                    ]}
                  />
                  <ThemedText
                    type="caption"
                    style={{
                      color:
                        index <= ["navigating", "arrived", "started", "completing"].indexOf(tripState)
                          ? theme.text
                          : theme.textTertiary,
                      fontSize: 10,
                    }}
                  >
                    {step}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.riderCard}>
            <View style={[styles.riderAvatar, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="user" size={24} color={theme.textSecondary} />
            </View>
            <View style={styles.riderInfo}>
              <View style={styles.riderNameRow}>
                <ThemedText type="h3">{RIDER_INFO.name}</ThemedText>
                <View style={styles.ratingBadge}>
                  <Feather name="star" size={12} color={theme.accent} />
                  <ThemedText type="caption">{RIDER_INFO.rating}</ThemedText>
                </View>
              </View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {tripState === "started" ? "En route to destination" : "Waiting at pickup"}
              </ThemedText>
            </View>
            <View style={styles.contactButtons}>
              <Pressable style={[styles.contactButton, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="message-circle" size={18} color={theme.text} />
              </Pressable>
              <Pressable style={[styles.contactButton, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="phone" size={18} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.tripDetails}>
            <View style={styles.tripLocation}>
              <View style={[styles.locationDot, { backgroundColor: theme.accent }]} />
              <View style={styles.locationText}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>PICKUP</ThemedText>
                <ThemedText type="body">{RIDER_INFO.pickupAddress}</ThemedText>
              </View>
              {tripState === "navigating" ? (
                <ThemedText type="h4" style={{ color: theme.accent }}>{eta} min</ThemedText>
              ) : null}
            </View>
            <View style={[styles.locationLine, { backgroundColor: theme.textTertiary }]} />
            <View style={styles.tripLocation}>
              <View style={[styles.locationDot, { backgroundColor: theme.text }]} />
              <View style={styles.locationText}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>DROPOFF</ThemedText>
                <ThemedText type="body">{RIDER_INFO.dropoffAddress}</ThemedText>
              </View>
              {tripState === "started" ? (
                <ThemedText type="h4" style={{ color: theme.accent }}>{RIDER_INFO.estimatedTime} min</ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.earningsPreview}>
            <Feather name="dollar-sign" size={18} color={theme.success} />
            <ThemedText type="h3" style={{ color: theme.success }}>
              ${RIDER_INFO.estimatedEarnings.toFixed(2)}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              estimated earnings
            </ThemedText>
          </View>

          <Button onPress={actionButton.action} fullWidth>
            {actionButton.label}
          </Button>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 5,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  placeholder: {
    width: 42,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    overflow: "hidden",
  },
  bottomSheetGradient: {
    padding: Spacing.xl,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressStep: {
    alignItems: "center",
    gap: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  riderInfo: {
    flex: 1,
    gap: 4,
  },
  riderNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  contactButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tripDetails: {
    marginBottom: Spacing.lg,
  },
  tripLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationText: {
    flex: 1,
    gap: 2,
  },
  locationLine: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginVertical: Spacing.xs,
  },
  earningsPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
});
