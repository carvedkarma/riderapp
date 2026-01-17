import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Pressable,
  Switch,
  Dimensions,
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
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
} from "react-native-reanimated";

import { MapViewWrapper, Marker } from "@/components/MapViewWrapper";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width, height } = Dimensions.get("window");

type DriverHomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverHome"
>;

interface Props {
  navigation: DriverHomeScreenNavigationProp;
}

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const ZONE_SUGGESTIONS = [
  { id: "1", zone: "Downtown", action: "High demand in 5 min", type: "hot" },
  { id: "2", zone: "Airport", action: "Surge starting soon", type: "surge" },
  { id: "3", zone: "Current", action: "Pickup likely within 3 min", type: "stay" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DriverHomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [todayTrips, setTodayTrips] = useState(0);
  const [showTripRequest, setShowTripRequest] = useState(false);

  const pulseScale = useSharedValue(1);
  const searchingOpacity = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);

        if (mapRef.current && Platform.OS !== "web") {
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

      const timer = setTimeout(() => {
        setShowTripRequest(true);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      pulseScale.value = withSpring(1);
      searchingOpacity.value = withTiming(0, { duration: 300 });
      setShowTripRequest(false);
    }
  }, [isOnline]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const searchingStyle = useAnimatedStyle(() => ({
    opacity: searchingOpacity.value,
  }));

  const handleToggleOnline = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setIsOnline(!isOnline);
  };

  const handleAcceptTrip = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setShowTripRequest(false);
    setTodayTrips(prev => prev + 1);
    setTodayEarnings(prev => prev + 18.50);
    navigation.navigate("DriverActiveTrip", { tripId: "trip-1" });
  };

  const handleDeclineTrip = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowTripRequest(false);
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

      {isOnline && !showTripRequest ? (
        <Animated.View style={[styles.searchingIndicator, searchingStyle]}>
          <View style={styles.searchingContent}>
            <View style={styles.pulseContainer}>
              <Animated.View style={[styles.pulseRing, { borderColor: theme.accent }, pulseStyle]} />
              <View style={[styles.searchingDot, { backgroundColor: theme.accent }]} />
            </View>
            <ThemedText type="h4">Searching for trips...</ThemedText>
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
              <Feather name="clock" size={18} color={theme.accent} />
              <ThemedText type="h3">2.5h</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Online
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="trending-up" size={18} color={theme.success} />
              <ThemedText type="h3">$12/h</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Rate
              </ThemedText>
            </View>
          </View>

          {isOnline ? (
            <View style={styles.suggestionsContainer}>
              <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                SMART SUGGESTIONS
              </ThemedText>
              {ZONE_SUGGESTIONS.slice(0, 2).map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  style={[styles.suggestionCard, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <View
                    style={[
                      styles.suggestionIcon,
                      {
                        backgroundColor:
                          suggestion.type === "hot"
                            ? theme.error + "20"
                            : suggestion.type === "surge"
                            ? theme.accent + "20"
                            : theme.success + "20",
                      },
                    ]}
                  >
                    <Feather
                      name={
                        suggestion.type === "hot"
                          ? "zap"
                          : suggestion.type === "surge"
                          ? "trending-up"
                          : "check-circle"
                      }
                      size={16}
                      color={
                        suggestion.type === "hot"
                          ? theme.error
                          : suggestion.type === "surge"
                          ? theme.accent
                          : theme.success
                      }
                    />
                  </View>
                  <View style={styles.suggestionText}>
                    <ThemedText type="body">{suggestion.zone}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {suggestion.action}
                    </ThemedText>
                  </View>
                  <Feather name="navigation" size={18} color={theme.accent} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </LinearGradient>
      </Animated.View>

      {showTripRequest ? (
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
              <View style={[styles.timerBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="caption" style={{ color: "#000000", fontWeight: "600" }}>
                  15s
                </ThemedText>
              </View>
            </View>

            <View style={styles.tripDetails}>
              <View style={styles.tripLocation}>
                <View style={[styles.locationDot, { backgroundColor: theme.accent }]} />
                <View style={styles.locationText}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>PICKUP</ThemedText>
                  <ThemedText type="body">123 Main Street</ThemedText>
                </View>
                <ThemedText type="h4" style={{ color: theme.accent }}>0.5 mi</ThemedText>
              </View>
              <View style={[styles.locationLine, { backgroundColor: theme.textTertiary }]} />
              <View style={styles.tripLocation}>
                <View style={[styles.locationDot, { backgroundColor: theme.text }]} />
                <View style={styles.locationText}>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>DROPOFF</ThemedText>
                  <ThemedText type="body">456 Market Ave</ThemedText>
                </View>
                <ThemedText type="h4">3.2 mi</ThemedText>
              </View>
            </View>

            <View style={styles.tripMeta}>
              <View style={styles.tripMetaItem}>
                <Feather name="dollar-sign" size={18} color={theme.success} />
                <ThemedText type="h3" style={{ color: theme.success }}>$18.50</ThemedText>
              </View>
              <View style={styles.tripMetaItem}>
                <Feather name="clock" size={18} color={theme.textSecondary} />
                <ThemedText type="body">~15 min</ThemedText>
              </View>
              <View style={styles.tripMetaItem}>
                <Feather name="star" size={18} color={theme.accent} />
                <ThemedText type="body">4.9</ThemedText>
              </View>
            </View>

            <View style={styles.tripActions}>
              <Button variant="outline" onPress={handleDeclineTrip} style={styles.declineButton}>
                Decline
              </Button>
              <Button onPress={handleAcceptTrip} style={styles.acceptButton}>
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
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  searchingContent: {
    alignItems: "center",
    gap: Spacing.lg,
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
  suggestionsContainer: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    fontSize: 11,
    fontWeight: "600",
  },
  suggestionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionText: {
    flex: 1,
    gap: 2,
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
  timerBadge: {
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
