import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
  Pressable,
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

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const SAVED_LOCATIONS = [
  { id: "1", name: "Home", address: "123 Main Street", icon: "home" as const, color: "#4A90D9" },
  { id: "2", name: "Work", address: "456 Business Ave", icon: "briefcase" as const, color: "#50C878" },
  { id: "3", name: "Gym", address: "789 Fitness Blvd", icon: "heart" as const, color: "#FF6B6B" },
];

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getSuggestion(): string {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 10) return "Rush hour - book early for best prices";
  if (hour >= 17 && hour < 20) return "Peak evening demand - prices may vary";
  if (hour >= 22 || hour < 6) return "Late night rides - stay safe";
  return "Great time to ride - normal pricing";
}

export default function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [currentAddress, setCurrentAddress] = useState("Where to?");

  const menuScale = useSharedValue(1);
  const profileScale = useSharedValue(1);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
          if (address) {
            setCurrentAddress(
              `${address.street || ""} ${address.name || ""}`.trim() || "Current Location"
            );
          }
        } catch (e) {
          setCurrentAddress("Current Location");
        }

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

  const handleDestinationPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.navigate("DestinationSearch");
  };

  const handleMenuPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Activity");
  };

  const handleProfilePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("Account");
  };

  const handleCurrentLocationPress = () => {
    if (location && mapRef.current && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        500
      );
    }
  };

  const handleSavedLocationPress = (locationId: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    navigation.navigate("DestinationSearch", { savedLocationId: locationId });
  };

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: menuScale.value }],
  }));

  const profileAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <MapViewWrapper
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={locationPermission === true}
        showsMyLocationButton={false}
        showsCompass={false}
        userInterfaceStyle="dark"
      >
        {location && Marker ? (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <View style={styles.userMarker}>
              <View style={[styles.userMarkerInner, { backgroundColor: theme.accent }]} />
            </View>
          </Marker>
        ) : null}
      </MapViewWrapper>

      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={[styles.topGradient, { paddingTop: insets.top }]}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <Animated.View entering={FadeIn.delay(200)}>
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: theme.accent }]}>
              <Feather name="navigation" size={16} color="#000000" />
            </View>
            <ThemedText type="h3" style={styles.logoText}>RideX</ThemedText>
          </View>
        </Animated.View>

        <View style={styles.topButtons}>
          <AnimatedPressable
            onPress={handleMenuPress}
            onPressIn={() => {
              menuScale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              menuScale.value = withSpring(1);
            }}
            style={[styles.iconButton, { backgroundColor: "rgba(28, 28, 30, 0.9)" }, menuAnimatedStyle]}
          >
            <Feather name="clock" size={20} color={theme.text} />
          </AnimatedPressable>

          <AnimatedPressable
            onPress={handleProfilePress}
            onPressIn={() => {
              profileScale.value = withSpring(0.9);
            }}
            onPressOut={() => {
              profileScale.value = withSpring(1);
            }}
            style={[styles.iconButton, { backgroundColor: "rgba(28, 28, 30, 0.9)" }, profileAnimatedStyle]}
          >
            <Feather name="user" size={20} color={theme.text} />
          </AnimatedPressable>
        </View>
      </View>

      <Animated.View
        entering={FadeIn.delay(100)}
        style={[styles.currentLocationButton, { backgroundColor: "rgba(28, 28, 30, 0.9)" }]}
      >
        <Pressable onPress={handleCurrentLocationPress} style={styles.locationButtonInner}>
          <Feather name="navigation" size={20} color={theme.accent} />
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={SlideInUp.delay(300).springify().damping(20)}
        style={[styles.bottomSheet]}
      >
        <LinearGradient
          colors={["#1C1C1E", "#0A0A0A"]}
          style={[styles.bottomSheetGradient, { paddingBottom: insets.bottom + Spacing.lg }]}
        >
          <View style={styles.bottomSheetHandle}>
            <View style={[styles.handleBar, { backgroundColor: "rgba(255,255,255,0.2)" }]} />
          </View>

          <View style={styles.bottomSheetContent}>
            <Animated.View entering={FadeInDown.delay(400)}>
              <ThemedText type="h2" style={styles.greeting}>
                {getGreeting()}
              </ThemedText>
              <View style={styles.suggestionRow}>
                <View style={[styles.suggestionDot, { backgroundColor: theme.accent }]} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {getSuggestion()}
                </ThemedText>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500)}>
              <Pressable
                onPress={handleDestinationPress}
                style={[styles.destinationInput, { backgroundColor: "rgba(255,255,255,0.08)" }]}
              >
                <View style={styles.searchIconContainer}>
                  <Feather name="search" size={18} color={theme.accent} />
                </View>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  {currentAddress === "Current Location" ? "Where to?" : currentAddress}
                </ThemedText>
                <View style={[styles.scheduleButton, { backgroundColor: theme.accent }]}>
                  <Feather name="clock" size={14} color="#000000" />
                  <ThemedText type="caption" style={{ color: "#000000", fontWeight: "600" }}>
                    Now
                  </ThemedText>
                </View>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600)} style={styles.savedLocationsContainer}>
              <View style={styles.savedLocationsScroll}>
                {SAVED_LOCATIONS.map((loc, index) => (
                  <Animated.View 
                    key={loc.id}
                    entering={FadeInUp.delay(650 + index * 100).springify()}
                  >
                    <Pressable
                      onPress={() => handleSavedLocationPress(loc.id)}
                      style={[styles.savedLocationPill]}
                    >
                      <View style={[styles.savedLocationIconSmall, { backgroundColor: loc.color + "30" }]}>
                        <Feather name={loc.icon} size={14} color={loc.color} />
                      </View>
                      <ThemedText type="small" style={{ color: theme.text }}>
                        {loc.name}
                      </ThemedText>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(800)}>
              <View style={styles.promoCard}>
                <LinearGradient
                  colors={[theme.accent + "20", theme.accent + "05"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.promoGradient}
                >
                  <View style={styles.promoContent}>
                    <View style={[styles.promoIcon, { backgroundColor: theme.accent }]}>
                      <Feather name="percent" size={16} color="#000000" />
                    </View>
                    <View style={styles.promoText}>
                      <ThemedText type="h4">20% off your next ride</ThemedText>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                        Use code RIDEX20
                      </ThemedText>
                    </View>
                    <Feather name="chevron-right" size={20} color={theme.accent} />
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.mapCenterMarker}>
        <View style={[styles.centerPinOuter, { borderColor: theme.accent }]}>
          <View style={[styles.centerPinInner, { backgroundColor: theme.accent }]} />
        </View>
        <View style={[styles.centerPinLine, { backgroundColor: theme.accent }]} />
        <View style={[styles.centerPinShadow]} />
      </View>
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
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontWeight: "700",
    letterSpacing: 1,
  },
  topButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  currentLocationButton: {
    position: "absolute",
    right: Spacing.lg,
    bottom: "52%",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 10,
  },
  locationButtonInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
  bottomSheetContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  destinationInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(212, 184, 122, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginLeft: "auto",
  },
  savedLocationsContainer: {
    marginTop: -Spacing.sm,
  },
  savedLocationsScroll: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  savedLocationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  savedLocationIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  promoCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 184, 122, 0.2)",
  },
  promoGradient: {
    padding: Spacing.lg,
  },
  promoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  promoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  promoText: {
    flex: 1,
    gap: 2,
  },
  mapCenterMarker: {
    position: "absolute",
    top: "30%",
    left: "50%",
    marginLeft: -16,
    alignItems: "center",
    zIndex: 5,
  },
  centerPinOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  centerPinInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  centerPinLine: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
  },
  centerPinShadow: {
    width: 20,
    height: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginTop: 2,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#D4B87A",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
