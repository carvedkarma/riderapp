import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
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
  { id: "1", name: "Home", address: "123 Main Street", icon: "home" as const },
  { id: "2", name: "Work", address: "456 Business Ave", icon: "briefcase" as const },
];

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const mapRef = useRef<any>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [currentAddress, setCurrentAddress] = useState("Set your destination");

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
              <View style={[styles.userMarkerInner, { backgroundColor: theme.mapAccent }]} />
            </View>
          </Marker>
        ) : null}
      </MapViewWrapper>

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <AnimatedPressable
          onPress={handleMenuPress}
          onPressIn={() => {
            menuScale.value = withSpring(0.9);
          }}
          onPressOut={() => {
            menuScale.value = withSpring(1);
          }}
          style={[styles.iconButton, { backgroundColor: theme.backgroundRoot }, menuAnimatedStyle]}
        >
          <Feather name="clock" size={22} color={theme.text} />
        </AnimatedPressable>

        <AnimatedPressable
          onPress={handleProfilePress}
          onPressIn={() => {
            profileScale.value = withSpring(0.9);
          }}
          onPressOut={() => {
            profileScale.value = withSpring(1);
          }}
          style={[styles.iconButton, { backgroundColor: theme.backgroundRoot }, profileAnimatedStyle]}
        >
          <Feather name="user" size={22} color={theme.text} />
        </AnimatedPressable>
      </View>

      <Animated.View
        entering={FadeIn.delay(100)}
        style={[styles.currentLocationButton, { backgroundColor: theme.backgroundRoot }]}
      >
        <Pressable onPress={handleCurrentLocationPress} style={styles.locationButtonInner}>
          <Feather name="crosshair" size={22} color={theme.text} />
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={SlideInUp.delay(200).springify()}
        style={[
          styles.bottomSheet,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        <View style={styles.bottomSheetHandle}>
          <View style={[styles.handleBar, { backgroundColor: theme.backgroundTertiary }]} />
        </View>

        <View style={styles.bottomSheetContent}>
          <ThemedText type="h2" style={styles.sheetTitle}>
            Set your destination
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: -Spacing.sm }}>
            Drag map to move pin
          </ThemedText>

          <Pressable
            onPress={handleDestinationPress}
            style={[styles.destinationInput, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={[styles.destinationIcon, { backgroundColor: theme.text }]}>
              <Feather name="square" size={10} color={theme.backgroundRoot} />
            </View>
            <ThemedText type="body" style={{ flex: 1 }}>
              {currentAddress}
            </ThemedText>
            <Feather name="search" size={20} color={theme.textSecondary} />
          </Pressable>

          <View style={styles.savedLocations}>
            {SAVED_LOCATIONS.map((loc) => (
              <Pressable
                key={loc.id}
                onPress={() => handleSavedLocationPress(loc.id)}
                style={[styles.savedLocationRow, { borderBottomColor: theme.backgroundSecondary }]}
              >
                <View style={[styles.savedLocationIcon, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name={loc.icon} size={16} color={theme.text} />
                </View>
                <View style={styles.savedLocationText}>
                  <ThemedText type="h4">{loc.name}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {loc.address}
                  </ThemedText>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textTertiary} />
              </Pressable>
            ))}
          </View>

          <Button onPress={handleDestinationPress} fullWidth>
            Confirm destination
          </Button>
        </View>
      </Animated.View>

      <View style={styles.mapCenterMarker}>
        <View style={[styles.centerPin, { backgroundColor: theme.text }]}>
          <View style={[styles.centerPinDot, { backgroundColor: theme.backgroundRoot }]} />
        </View>
        <View style={[styles.centerPinShadow, { backgroundColor: theme.text }]} />
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
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  currentLocationButton: {
    position: "absolute",
    right: Spacing.lg,
    bottom: "48%",
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
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
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    ...Shadows.large,
  },
  bottomSheetHandle: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  handleBar: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  bottomSheetContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  sheetTitle: {
    textAlign: "center",
  },
  destinationInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  destinationIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  savedLocations: {
    gap: 0,
  },
  savedLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  savedLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  savedLocationText: {
    flex: 1,
    gap: 2,
  },
  mapCenterMarker: {
    position: "absolute",
    top: "35%",
    left: "50%",
    marginLeft: -15,
    alignItems: "center",
    zIndex: 5,
  },
  centerPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  centerPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  centerPinShadow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
    opacity: 0.3,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
