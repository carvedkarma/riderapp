import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { MapViewWrapper } from "@/components/MapViewWrapper";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { DriverStackParamList } from "@/navigation/DriverStackNavigator";

const { width } = Dimensions.get("window");

type DriverActiveTripScreenNavigationProp = NativeStackNavigationProp<
  DriverStackParamList,
  "DriverActiveTrip"
>;

type DriverActiveTripScreenRouteProp = RouteProp<
  DriverStackParamList,
  "DriverActiveTrip"
>;

interface Props {
  navigation: DriverActiveTripScreenNavigationProp;
  route: DriverActiveTripScreenRouteProp;
}

interface RideDetails {
  id: string;
  pickupAddress: string;
  pickupLatitude: string;
  pickupLongitude: string;
  destinationAddress: string;
  destinationLatitude: string;
  destinationLongitude: string;
  estimatedFare: string;
  estimatedDistance: string;
  estimatedDuration: number;
  status: string;
  rider: {
    id: string;
    fullName: string;
    rating: string;
    avatarUrl: string | null;
    phone: string | null;
  };
}

type TripState = "navigating" | "arrived" | "started" | "completing";

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function DriverActiveTripScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);
  const queryClient = useQueryClient();

  const [tripState, setTripState] = useState<TripState>("navigating");
  const [eta, setEta] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const progress = useSharedValue(0);

  const { data: ride, isLoading: isLoadingRide } = useQuery<RideDetails>({
    queryKey: ["/api/rides", route.params.tripId],
  });

  useEffect(() => {
    if (ride?.status === "driver_arriving") {
      setTripState("arrived");
    } else if (ride?.status === "in_progress") {
      setTripState("started");
    }
  }, [ride?.status]);

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

  const handleArrived = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsLoading(true);
    try {
      await fetch(new URL(`/api/rides/${route.params.tripId}/arrive`, getApiUrl()).toString(), {
        method: "POST",
      });
      setTripState("arrived");
      queryClient.invalidateQueries({ queryKey: ["/api/rides", route.params.tripId] });
    } catch (error) {
      console.error("Failed to mark arrival:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    setIsLoading(true);
    try {
      await fetch(new URL(`/api/rides/${route.params.tripId}/start`, getApiUrl()).toString(), {
        method: "POST",
      });
      setTripState("started");
      queryClient.invalidateQueries({ queryKey: ["/api/rides", route.params.tripId] });
    } catch (error) {
      console.error("Failed to start trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(
        new URL(`/api/rides/${route.params.tripId}/complete`, getApiUrl()).toString(),
        { method: "POST" }
      );
      const completedRide = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
      
      navigation.replace("DriverTripComplete", {
        tripId: route.params.tripId,
        earnings: completedRide.driverEarnings || "0",
      });
    } catch (error) {
      console.error("Failed to complete trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      await fetch(new URL(`/api/rides/${route.params.tripId}/cancel`, getApiUrl()).toString(), {
        method: "POST",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rides"] });
    } catch (error) {
      console.error("Failed to cancel ride:", error);
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

  if (isLoadingRide) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <ThemedText type="body" style={{ marginTop: Spacing.lg }}>Loading trip details...</ThemedText>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="alert-circle" size={48} color={theme.error} />
        <ThemedText type="h3" style={{ marginTop: Spacing.lg }}>Trip not found</ThemedText>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: Spacing.xl }}>
          Go Back
        </Button>
      </View>
    );
  }

  const driverEarnings = Number(ride.estimatedFare) * 0.8;

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
                <ThemedText type="h3">{ride.rider?.fullName || "Rider"}</ThemedText>
                <View style={styles.ratingBadge}>
                  <Feather name="star" size={12} color={theme.accent} />
                  <ThemedText type="caption">{ride.rider?.rating || "5.0"}</ThemedText>
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
                <ThemedText type="body" numberOfLines={1}>{ride.pickupAddress}</ThemedText>
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
                <ThemedText type="body" numberOfLines={1}>{ride.destinationAddress}</ThemedText>
              </View>
              {tripState === "started" ? (
                <ThemedText type="h4" style={{ color: theme.accent }}>{ride.estimatedDuration} min</ThemedText>
              ) : null}
            </View>
          </View>

          <View style={styles.earningsPreview}>
            <Feather name="dollar-sign" size={18} color={theme.success} />
            <ThemedText type="h3" style={{ color: theme.success }}>
              ${driverEarnings.toFixed(2)}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              estimated earnings
            </ThemedText>
          </View>

          <Button onPress={actionButton.action} fullWidth loading={isLoading}>
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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
