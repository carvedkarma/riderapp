import React, { useState, useRef } from "react";
import { StyleSheet, View, ScrollView, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { MapViewWrapper, Marker, Polyline } from "@/components/MapViewWrapper";
import { VehicleCard, VehicleTier } from "@/components/VehicleCard";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { FareLockTimer } from "@/components/FareLockTimer";
import { RidePreferences } from "@/components/RidePreferences";
import { DriverEarningsBadge } from "@/components/DriverEarningsBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

type RideConfirmationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RideConfirmation"
>;

type RideConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  "RideConfirmation"
>;

interface Props {
  navigation: RideConfirmationScreenNavigationProp;
  route: RideConfirmationScreenRouteProp;
}

const VEHICLE_TIERS: (VehicleTier & { driverEarnings: string })[] = [
  {
    id: "economy",
    name: "Economy",
    description: "Affordable everyday rides",
    eta: "3 min away",
    price: "$12.50",
    capacity: 4,
    image: require("../../assets/images/vehicle-economy.png"),
    driverEarnings: "$9.80",
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Newer cars with extra legroom",
    eta: "5 min away",
    price: "$18.75",
    capacity: 4,
    image: require("../../assets/images/vehicle-comfort.png"),
    driverEarnings: "$14.50",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Luxury sedans with top-rated drivers",
    eta: "7 min away",
    price: "$28.00",
    capacity: 4,
    image: require("../../assets/images/vehicle-premium.png"),
    driverEarnings: "$22.40",
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "High-end vehicles for special occasions",
    eta: "10 min away",
    price: "$45.00",
    capacity: 4,
    image: require("../../assets/images/vehicle-luxury.png"),
    driverEarnings: "$36.00",
  },
];

export default function RideConfirmationScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<any>(null);

  const { pickup, destination } = route.params;
  const [selectedVehicle, setSelectedVehicle] = useState<string>("economy");
  const [isRequesting, setIsRequesting] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const selectedTier = VEHICLE_TIERS.find((v) => v.id === selectedVehicle);

  const handleVehicleSelect = (vehicleId: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedVehicle(vehicleId);
  };

  const handleRequestRide = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsRequesting(true);
    
    setTimeout(() => {
      setIsRequesting(false);
      navigation.navigate("ActiveRide", {
        rideId: "ride_" + Date.now(),
        pickup,
        destination,
        vehicleTier: selectedVehicle,
      });
    }, 1500);
  };

  const routeCoordinates = [
    { latitude: pickup.latitude, longitude: pickup.longitude },
    {
      latitude: (pickup.latitude + destination.latitude) / 2 + 0.005,
      longitude: (pickup.longitude + destination.longitude) / 2 - 0.005,
    },
    { latitude: destination.latitude, longitude: destination.longitude },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={styles.mapContainer}>
        <MapViewWrapper
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: (pickup.latitude + destination.latitude) / 2,
            longitude: (pickup.longitude + destination.longitude) / 2,
            latitudeDelta: Math.abs(pickup.latitude - destination.latitude) * 2,
            longitudeDelta: Math.abs(pickup.longitude - destination.longitude) * 2,
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
            </>
          ) : null}
          
          {Polyline ? (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={theme.accent}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          ) : null}
        </MapViewWrapper>
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: theme.backgroundRoot }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <View style={styles.routeSummary}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
                <ThemedText type="small" numberOfLines={1} style={styles.routeText}>
                  {pickup.address}
                </ThemedText>
              </View>
              <View style={styles.routePoint}>
                <View style={[styles.routeSquare, { backgroundColor: theme.text }]} />
                <ThemedText type="small" numberOfLines={1} style={styles.routeText}>
                  {destination.address}
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(150).springify()}>
            <FareLockTimer initialSeconds={120} onExpire={() => {}} />
          </Animated.View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vehicleList}
          >
            {VEHICLE_TIERS.map((vehicle, index) => (
              <Animated.View 
                key={vehicle.id} 
                style={styles.vehicleCardWrapper}
                entering={FadeInDown.delay(200 + index * 50).springify()}
              >
                <VehicleCard
                  vehicle={vehicle}
                  selected={selectedVehicle === vehicle.id}
                  onPress={() => handleVehicleSelect(vehicle.id)}
                />
              </Animated.View>
            ))}
          </ScrollView>

          {selectedTier ? (
            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <DriverEarningsBadge earnings={selectedTier.driverEarnings} />
            </Animated.View>
          ) : null}

          <RidePreferences onPreferencesChange={() => {}} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.priceBreakdown}>
            <View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Estimated fare
              </ThemedText>
              <ThemedText type="h2">{selectedTier?.price}</ThemedText>
            </View>
            <View style={styles.etaInfo}>
              <Feather name="clock" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {selectedTier?.eta}
              </ThemedText>
            </View>
          </View>
          <Button
            onPress={handleRequestRide}
            loading={isRequesting}
            style={styles.requestButton}
          >
            Request {selectedTier?.name}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: "35%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -Spacing.xl,
    ...Shadows.large,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  routeSummary: {
    gap: Spacing.sm,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  routeText: {
    flex: 1,
  },
  vehicleList: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
  },
  vehicleCardWrapper: {
    width: width * 0.72,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  priceBreakdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  requestButton: {
    width: "100%",
  },
});
