import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { MapViewWrapper, Marker, Polyline } from "@/components/MapViewWrapper";
import { DriverCard } from "@/components/DriverCard";
import { SOSButton } from "@/components/SOSButton";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width, height } = Dimensions.get("window");

type ActiveRideScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ActiveRide"
>;

type ActiveRideScreenRouteProp = RouteProp<RootStackParamList, "ActiveRide">;

interface Props {
  navigation: ActiveRideScreenNavigationProp;
  route: ActiveRideScreenRouteProp;
}

const MOCK_DRIVER = {
  name: "Michael Chen",
  rating: "4.9",
  vehicleMake: "Tesla",
  vehicleModel: "Model 3",
  vehicleColor: "White",
  vehiclePlate: "7ABC123",
  isVerified: true,
  totalRides: 2847,
};

type RideStatus = "finding_driver" | "driver_arriving" | "in_progress" | "arriving";

export default function ActiveRideScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<any>(null);

  const { pickup, destination } = route.params;
  const [status, setStatus] = useState<RideStatus>("finding_driver");
  const [eta, setEta] = useState("5 min");
  const [driverLocation, setDriverLocation] = useState({
    latitude: pickup.latitude + 0.008,
    longitude: pickup.longitude - 0.005,
  });

  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatus("driver_arriving");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 2000);

    const timer2 = setTimeout(() => {
      setDriverLocation({
        latitude: pickup.latitude + 0.003,
        longitude: pickup.longitude - 0.002,
      });
      setEta("2 min");
    }, 4000);

    const timer3 = setTimeout(() => {
      setDriverLocation({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      });
      setStatus("in_progress");
      setEta("15 min");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleSOS = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleCancelRide = () => {
    navigation.goBack();
    navigation.goBack();
  };

  const handleCompleteRide = () => {
    navigation.navigate("RideComplete", {
      rideId: route.params.rideId,
      fare: "$18.75",
      driver: MOCK_DRIVER,
    });
  };

  const getStatusText = () => {
    switch (status) {
      case "finding_driver":
        return "Finding your driver...";
      case "driver_arriving":
        return "Driver is on the way";
      case "in_progress":
        return "On the way to destination";
      case "arriving":
        return "Arriving at destination";
      default:
        return "";
    }
  };

  const routeCoordinates = [
    { latitude: pickup.latitude, longitude: pickup.longitude },
    {
      latitude: (pickup.latitude + destination.latitude) / 2 + 0.003,
      longitude: (pickup.longitude + destination.longitude) / 2 - 0.003,
    },
    { latitude: destination.latitude, longitude: destination.longitude },
  ];

  return (
    <View style={styles.container}>
      <MapViewWrapper
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        userInterfaceStyle={isDark ? "dark" : "light"}
      >
        {Marker ? (
          <>
            <Marker coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}>
              <View style={[styles.pickupMarker, { backgroundColor: theme.accent }]}>
                <Feather name="circle" size={12} color="#FFFFFF" />
              </View>
            </Marker>

            <Marker coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}>
              <View style={[styles.destinationMarker, { backgroundColor: theme.text }]}>
                <Feather name="map-pin" size={14} color="#FFFFFF" />
              </View>
            </Marker>

            {status !== "finding_driver" ? (
              <Marker coordinate={driverLocation}>
                <View style={[styles.driverMarker, { backgroundColor: "#000000" }]}>
                  <Feather name="navigation" size={16} color="#FFFFFF" />
                </View>
              </Marker>
            ) : null}
          </>
        ) : null}

        {status === "in_progress" && Polyline ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={theme.accent}
            strokeWidth={4}
          />
        ) : null}
      </MapViewWrapper>

      <View style={[styles.topContainer, { paddingTop: insets.top + Spacing.md }]}>
        <GlassCard style={styles.statusCard}>
          {status === "finding_driver" ? (
            <Animated.View style={[styles.pulseIndicator, { backgroundColor: theme.accent }, pulseStyle]} />
          ) : null}
          <ThemedText type="h3">{getStatusText()}</ThemedText>
          {status !== "finding_driver" ? (
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              ETA: {eta}
            </ThemedText>
          ) : null}
        </GlassCard>

        <SOSButton onPress={handleSOS} compact />
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {status !== "finding_driver" ? (
          <DriverCard
            driver={MOCK_DRIVER}
            eta={status === "driver_arriving" ? eta : undefined}
            onCallPress={() => {}}
            onMessagePress={() => {}}
          />
        ) : null}

        {status === "finding_driver" ? (
          <Button variant="outline" onPress={handleCancelRide}>
            Cancel Ride
          </Button>
        ) : null}

        {status === "in_progress" ? (
          <Button variant="secondary" onPress={handleCompleteRide}>
            Complete Ride (Demo)
          </Button>
        ) : null}
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
  topContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  statusCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  pickupMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  destinationMarker: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
  },
  driverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.large,
  },
});
