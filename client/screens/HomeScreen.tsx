import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, Platform, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { MapViewWrapper, Marker } from "@/components/MapViewWrapper";
import { SearchBar } from "@/components/SearchBar";
import { GlassCard } from "@/components/GlassCard";
import { InsightPanel } from "@/components/InsightPanel";
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
  { id: "1", name: "Home", icon: "home" as const, color: "#007AFF" },
  { id: "2", name: "Work", icon: "briefcase" as const, color: "#34C759" },
  { id: "3", name: "Gym", icon: "activity" as const, color: "#FF9500" },
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
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <SearchBar placeholder="Where to?" onPress={handleSearchPress} />
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.savedLocationsContainer}
        >
          {SAVED_LOCATIONS.map((loc, index) => (
            <Animated.View 
              key={loc.id}
              entering={FadeInDown.delay(200 + index * 50).springify()}
            >
              <GlassCard
                onPress={() => handleSavedLocationPress(loc.id)}
                style={styles.savedLocationPill}
              >
                <View style={[styles.savedLocationIcon, { backgroundColor: `${loc.color}20` }]}>
                  <Feather name={loc.icon} size={14} color={loc.color} />
                </View>
                <ThemedText type="small">{loc.name}</ThemedText>
              </GlassCard>
            </Animated.View>
          ))}
        </Animated.View>

        <InsightPanel onPress={() => {}} />
      </View>

      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: tabBarHeight + Spacing.lg },
        ]}
      >
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <GlassCard
            onPress={handleCurrentLocationPress}
            style={styles.currentLocationButton}
          >
            <Feather name="navigation" size={20} color={theme.accent} />
          </GlassCard>
        </Animated.View>
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
  savedLocationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
