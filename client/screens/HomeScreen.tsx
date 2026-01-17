import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { MapViewWrapper, Marker } from "@/components/MapViewWrapper";
import { SearchBar } from "@/components/SearchBar";
import { GlassCard } from "@/components/GlassCard";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { MainTabParamList } from "@/navigation/MainTabNavigator";

const { width, height } = Dimensions.get("window");

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "HomeTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const SAVED_LOCATIONS = [
  { id: "1", name: "Home", icon: "home" as const },
  { id: "2", name: "Work", icon: "briefcase" as const },
];

const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const mapRef = useRef<any>(null);
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");
      
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        
        if (mapRef.current && Platform.OS !== "web") {
          mapRef.current.animateToRegion({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      }
    })();
  }, []);

  const handleSearchPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("DestinationSearch");
  };

  const handleSavedLocationPress = (locationId: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    navigation.navigate("DestinationSearch", { savedLocationId: locationId });
  };

  const handleCurrentLocationPress = () => {
    if (location && mapRef.current && Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <MapViewWrapper
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={locationPermission === true}
        showsMyLocationButton={false}
        showsCompass={false}
        userInterfaceStyle={isDark ? "dark" : "light"}
      >
        {location && Marker ? (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <View style={[styles.userMarker, { borderColor: theme.accent }]}>
              <View style={[styles.userMarkerInner, { backgroundColor: theme.accent }]} />
            </View>
          </Marker>
        ) : null}
      </MapViewWrapper>

      <View style={[styles.topContainer, { paddingTop: insets.top + Spacing.md }]}>
        <SearchBar placeholder="Where to?" onPress={handleSearchPress} />
        
        <View style={styles.savedLocationsContainer}>
          {SAVED_LOCATIONS.map((loc) => (
            <GlassCard
              key={loc.id}
              onPress={() => handleSavedLocationPress(loc.id)}
              style={styles.savedLocationPill}
            >
              <Feather name={loc.icon} size={16} color={theme.text} />
              <ThemedText type="small">{loc.name}</ThemedText>
            </GlassCard>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: tabBarHeight + Spacing.lg },
        ]}
      >
        <GlassCard
          onPress={handleCurrentLocationPress}
          style={styles.currentLocationButton}
        >
          <Feather name="navigation" size={20} color={theme.accent} />
        </GlassCard>
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
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  savedLocationsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  savedLocationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  currentLocationButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderRadius: BorderRadius.full,
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
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
