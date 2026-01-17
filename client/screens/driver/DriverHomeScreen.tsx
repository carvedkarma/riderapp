import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  SlideInUp,
} from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { MapViewWrapper, Marker } from "@/components/MapViewWrapper";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DriverStackParamList } from "@/navigation/DriverStackNavigator";

const { width, height } = Dimensions.get("window");

type DriverHomeScreenNavigationProp = NativeStackNavigationProp<
  DriverStackParamList,
  "DriverHome"
>;

interface Props {
  navigation: DriverHomeScreenNavigationProp;
}

interface RideRequest {
  id: string;
  userId: string;
  pickupAddress: string;
  pickupLatitude: string;
  pickupLongitude: string;
  destinationAddress: string;
  destinationLatitude: string;
  destinationLongitude: string;
  estimatedFare: string;
  estimatedDistance: string;
  estimatedDuration: number;
  vehicleTier: string;
  status: string;
  createdAt: string;
  rider?: {
    fullName: string;
    rating: string;
  };
}

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function DriverHomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);
  const queryClient = useQueryClient();
  
  const { user, driverProfile, updateDriverProfile } = useAuthStore();

  const [isOnline, setIsOnline] = useState(driverProfile?.isOnline ?? false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [currentRideRequest, setCurrentRideRequest] = useState<RideRequest | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const pulseScale = useSharedValue(1);
  const searchingOpacity = useSharedValue(0);

  const { data: pendingRides = [], refetch: refetchRides } = useQuery<RideRequest[]>({
    queryKey: ["/api/rides/pending"],
    enabled: isOnline && !currentRideRequest,
    refetchInterval: isOnline && !currentRideRequest ? 3000 : false,
  });

  const { data: driverRides = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers", user?.id, "rides"],
    enabled: !!user?.id,
  });

  const todayEarnings = driverRides
    .filter(r => r.status === "completed" && new Date(r.completedAt).toDateString() === new Date().toDateString())
    .reduce((sum, r) => sum + Number(r.driverEarnings || 0), 0);

  const todayTrips = driverRides
    .filter(r => r.status === "completed" && new Date(r.completedAt).toDateString() === new Date().toDateString())
    .length;

  useEffect(() => {
    if (pendingRides.length > 0 && !currentRideRequest && isOnline) {
      const newestRide = pendingRides[0];
      setCurrentRideRequest(newestRide);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [pendingRides, currentRideRequest, isOnline]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            },
            1000
          );
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (isOnline) {
      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 1500 }),
        -1,
        true
      );
      searchingOpacity.value = withTiming(1, { duration: 500 });
    } else {
      pulseScale.value = withSpring(1);
      searchingOpacity.value = withTiming(0, { duration: 300 });
      setCurrentRideRequest(null);
    }
  }, [isOnline]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const searchingStyle = useAnimatedStyle(() => ({
    opacity: searchingOpacity.value,
  }));

  const handleToggleOnline = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    const newOnlineStatus = !isOnline;
    setIsOnline(newOnlineStatus);
    
    if (!user?.id) return;
    
    try {
      const endpoint = newOnlineStatus ? "go-online" : "go-offline";
      const body: any = {};
      
      if (newOnlineStatus && location) {
        body.latitude = location.coords.latitude.toString();
        body.longitude = location.coords.longitude.toString();
      }
      
      await fetch(new URL(`/api/drivers/${user.id}/${endpoint}`, getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      updateDriverProfile({ isOnline: newOnlineStatus });
    } catch (error) {
      console.error("Failed to update online status:", error);
      setIsOnline(!newOnlineStatus);
    }
  };

  const handleAcceptTrip = async () => {
    if (!currentRideRequest || !user?.id) return;
    
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsAccepting(true);
    
    try {
      const response = await fetch(
        new URL(`/api/rides/${currentRideRequest.id}/accept`, getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverId: user.id }),
        }
      );
      
      if (response.ok) {
        setCurrentRideRequest(null);
        queryClient.invalidateQueries({ queryKey: ["/api/rides/pending"] });
        navigation.navigate("DriverActiveTrip", { tripId: currentRideRequest.id });
      } else {
        const data = await response.json();
        setCurrentRideRequest(null);
        refetchRides();
      }
    } catch (error) {
      console.error("Failed to accept ride:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineTrip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setCurrentRideRequest(null);
  };

  const handleEarningsPress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    navigation.navigate("DriverEarnings");
  };

  const handleProfilePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    navigation.navigate("DriverProfile");
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dx = (lat2 - lat1) * 69;
    const dy = (lon2 - lon1) * 54.6;
    return Math.sqrt(dx * dx + dy * dy).toFixed(1);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <MapViewWrapper
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        userInterfaceStyle="dark"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: theme.accent }]}>
            <Feather name="truck" size={14} color="#000000" />
          </View>
          <ThemedText type="h4">Driver</ThemedText>
        </View>

        <View style={styles.topButtons}>
          <Pressable
            onPress={handleEarningsPress}
            style={[styles.earningsButton, { backgroundColor: "rgba(28, 28, 30, 0.9)" }]}
          >
            <ThemedText type="h4" style={{ color: theme.accent }}>
              ${todayEarnings.toFixed(2)}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Today
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleProfilePress}
            style={[styles.iconButton, { backgroundColor: "rgba(28, 28, 30, 0.9)" }]}
          >
            <Feather name="user" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {isOnline && !currentRideRequest ? (
        <Animated.View style={[styles.searchingIndicator, searchingStyle]}>
          <View style={styles.searchingContent}>
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseRing, { borderColor: theme.accent }, pulseStyle]} />
              <View style={[styles.searchingDot, { backgroundColor: theme.accent }]} />
            </View>
            <ThemedText type="h4">Searching for trips...</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {pendingRides.length > 0 ? `${pendingRides.length} pending` : "Waiting for riders"}
            </ThemedText>
          </View>
        </Animated.View>
      ) : null}

      <Animated.View
        entering={SlideInUp.delay(200).springify()}
        style={[styles.bottomSheet]}
      >
        <LinearGradient
          colors={["#1C1C1E", "#0A0A0A"]}
          style={[styles.bottomSheetGradient, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.bottomSheetHandle}>
            <View style={[styles.handleBar, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusInfo}>
              <ThemedText type="h3">
                {isOnline ? "You're Online" : "You're Offline"}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {isOnline ? "Accepting trip requests" : "Go online to start earning"}
              </ThemedText>
            </View>

            <Pressable
              onPress={handleToggleOnline}
              style={[
                styles.statusToggle,
                { backgroundColor: isOnline ? theme.success : theme.backgroundTertiary },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  { transform: [{ translateX: isOnline ? 28 : 0 }] },
                ]}
              />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="navigation" size={18} color={theme.accent} />
              <ThemedText type="h3">{todayTrips}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Trips
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="dollar-sign" size={18} color={theme.success} />
              <ThemedText type="h3">${todayEarnings.toFixed(0)}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Earned
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="star" size={18} color={theme.accent} />
              <ThemedText type="h3">{driverProfile?.driverRating || "5.0"}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Rating
              </ThemedText>
            </View>
          </View>

          {!isOnline ? (
            <View style={styles.offlineHint}>
              <Feather name="info" size={16} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
                Toggle online to start receiving ride requests from nearby riders
              </ThemedText>
            </View>
          ) : null}
        </LinearGradient>
      </Animated.View>

      {currentRideRequest ? (
        <Animated.View
          entering={SlideInUp.springify()}
          style={[styles.tripRequestOverlay, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <LinearGradient
            colors={["#1C1C1E", "#0A0A0A"]}
            style={styles.tripRequestCard}
          >
            <View style={styles.tripRequestHeader}>
              <ThemedText type="h3">New Trip Request</ThemedText>
              <View style={[styles.tierBadge, { backgroundColor: theme.accent + "20" }]}>
                <ThemedText type="caption" style={{ color: theme.accent, fontWeight: "600" }}>
                  {currentRideRequest.vehicleTier.toUpperCase()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.tripDetails}>
              <View style={styles.tripLocation}>
                <View style={[styles.locationDot, { backgroundColor: theme.accent }]} />
                <View style={styles.locationText}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>PICKUP</ThemedText>
                  <ThemedText type="body" numberOfLines={1}>
                    {currentRideRequest.pickupAddress}
                  </ThemedText>
                </View>
                {location ? (
                  <ThemedText type="h4" style={{ color: theme.accent }}>
                    {calculateDistance(
                      location.coords.latitude,
                      location.coords.longitude,
                      parseFloat(currentRideRequest.pickupLatitude),
                      parseFloat(currentRideRequest.pickupLongitude)
                    )} mi
                  </ThemedText>
                ) : null}
              </View>
              <View style={[styles.locationLine, { backgroundColor: theme.textTertiary }]} />
              <View style={styles.tripLocation}>
                <View style={[styles.locationDot, { backgroundColor: theme.text }]} />
                <View style={styles.locationText}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>DROPOFF</ThemedText>
                  <ThemedText type="body" numberOfLines={1}>
                    {currentRideRequest.destinationAddress}
                  </ThemedText>
                </View>
                <ThemedText type="h4">{currentRideRequest.estimatedDistance} mi</ThemedText>
              </View>
            </View>

            <View style={styles.tripMeta}>
              <View style={styles.tripMetaItem}>
                <Feather name="dollar-sign" size={18} color={theme.success} />
                <ThemedText type="h3" style={{ color: theme.success }}>
                  ${(Number(currentRideRequest.estimatedFare) * 0.8).toFixed(2)}
                </ThemedText>
              </View>
              <View style={styles.tripMetaItem}>
                <Feather name="clock" size={18} color={theme.textSecondary} />
                <ThemedText type="body">~{currentRideRequest.estimatedDuration} min</ThemedText>
              </View>
              {currentRideRequest.rider ? (
                <View style={styles.tripMetaItem}>
                  <Feather name="star" size={18} color={theme.accent} />
                  <ThemedText type="body">{currentRideRequest.rider.rating || "5.0"}</ThemedText>
                </View>
              ) : null}
            </View>

            <View style={styles.tripActions}>
              <Button variant="outline" onPress={handleDeclineTrip} style={styles.declineButton}>
                Decline
              </Button>
              <Button 
                onPress={handleAcceptTrip} 
                style={styles.acceptButton}
                loading={isAccepting}
              >
                Accept
              </Button>
            </View>
          </LinearGradient>
        </Animated.View>
      ) : null}
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  topButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  earningsButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  searchingIndicator: {
    position: "absolute",
    top: "35%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  searchingContent: {
    alignItems: "center",
    gap: Spacing.md,
  },
  pulseContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
  },
  searchingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
  },
  bottomSheetHandle: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statusInfo: {
    gap: 4,
  },
  statusToggle: {
    width: 60,
    height: 32,
    borderRadius: 16,
    padding: 2,
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  offlineHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: BorderRadius.md,
  },
  tripRequestOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  tripRequestCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  tripRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  tierBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
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
    height: 24,
    marginLeft: 5,
    marginVertical: Spacing.xs,
  },
  tripMeta: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: Spacing.lg,
  },
  tripMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tripActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 2,
  },
});
