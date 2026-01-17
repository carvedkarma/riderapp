import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, TextInput, Platform, Pressable, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { LocationRow } from "@/components/LocationRow";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / 3;

type DestinationSearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DestinationSearch"
>;

type DestinationSearchScreenRouteProp = RouteProp<
  RootStackParamList,
  "DestinationSearch"
>;

interface Props {
  navigation: DestinationSearchScreenNavigationProp;
  route: DestinationSearchScreenRouteProp;
}

interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  type: "popular" | "nearby" | "search";
  distance?: string;
  icon: keyof typeof Feather.glyphMap;
  latitude: number;
  longitude: number;
}

const SAVED_LOCATIONS = [
  {
    id: "saved-1",
    name: "Home",
    address: "Add your home address",
    icon: "home" as const,
    iconColor: "#4A90D9",
    latitude: 0,
    longitude: 0,
  },
  {
    id: "saved-2",
    name: "Work",
    address: "Add your work address",
    icon: "briefcase" as const,
    iconColor: "#50C878",
    latitude: 0,
    longitude: 0,
  },
];

const POPULAR_DESTINATIONS: PlaceSuggestion[] = [
  { id: "pop-1", name: "Airport", address: "International Airport", type: "popular", distance: "25m", icon: "navigation", latitude: 0, longitude: 0 },
  { id: "pop-2", name: "Downtown", address: "City Center", type: "popular", distance: "15m", icon: "map-pin", latitude: 0, longitude: 0 },
  { id: "pop-3", name: "Mall", address: "Shopping Center", type: "popular", distance: "10m", icon: "shopping-bag", latitude: 0, longitude: 0 },
  { id: "pop-4", name: "Station", address: "Central Railway", type: "popular", distance: "12m", icon: "map", latitude: 0, longitude: 0 },
  { id: "pop-5", name: "Hospital", address: "Medical Center", type: "popular", distance: "8m", icon: "plus-circle", latitude: 0, longitude: 0 },
];

const SEARCHABLE_PLACES: PlaceSuggestion[] = [
  { id: "s-1", name: "Airport Terminal 1", address: "Departure & Arrivals", type: "search", icon: "navigation", latitude: 0, longitude: 0 },
  { id: "s-2", name: "Airport Terminal 2", address: "International Flights", type: "search", icon: "navigation", latitude: 0, longitude: 0 },
  { id: "s-3", name: "Central Park", address: "Recreation Area", type: "search", icon: "sun", latitude: 0, longitude: 0 },
  { id: "s-4", name: "Central Station", address: "Main Railway Hub", type: "search", icon: "map", latitude: 0, longitude: 0 },
  { id: "s-5", name: "City Mall", address: "Shopping Complex", type: "search", icon: "shopping-bag", latitude: 0, longitude: 0 },
  { id: "s-6", name: "Convention Center", address: "Events Venue", type: "search", icon: "calendar", latitude: 0, longitude: 0 },
  { id: "s-7", name: "Downtown Plaza", address: "City Center", type: "search", icon: "map-pin", latitude: 0, longitude: 0 },
  { id: "s-8", name: "Grand Hotel", address: "5-Star Luxury", type: "search", icon: "star", latitude: 0, longitude: 0 },
  { id: "s-9", name: "Hospital Emergency", address: "24/7 Medical", type: "search", icon: "plus-circle", latitude: 0, longitude: 0 },
  { id: "s-10", name: "Museum of Art", address: "Cultural Exhibition", type: "search", icon: "image", latitude: 0, longitude: 0 },
  { id: "s-11", name: "National Stadium", address: "Sports Arena", type: "search", icon: "award", latitude: 0, longitude: 0 },
  { id: "s-12", name: "Restaurant Row", address: "Dining District", type: "search", icon: "coffee", latitude: 0, longitude: 0 },
  { id: "s-13", name: "University Campus", address: "Education Center", type: "search", icon: "book", latitude: 0, longitude: 0 },
  { id: "s-14", name: "Beach Resort", address: "Coastal Area", type: "search", icon: "sun", latitude: 0, longitude: 0 },
  { id: "s-15", name: "Tech Park", address: "Business District", type: "search", icon: "briefcase", latitude: 0, longitude: 0 },
];

export default function DestinationSearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [pickupLocation, setPickupLocation] = useState("Detecting location...");
  const [destination, setDestination] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [currentCoords, setCurrentCoords] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          try {
            const [address] = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            if (address) {
              const formattedAddress = [
                address.street,
                address.city,
              ].filter(Boolean).join(", ");
              setPickupLocation(formattedAddress || "Current Location");
            } else {
              setPickupLocation("Current Location");
            }
          } catch {
            setPickupLocation("Current Location");
          }
        } else {
          setPickupLocation("Location access needed");
        }
      } catch {
        setPickupLocation("Current Location");
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  const searchResults = useMemo(() => {
    if (destination.length < 1) return [];
    const query = destination.toLowerCase().trim();
    return SEARCHABLE_PLACES.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query)
    ).slice(0, 6);
  }, [destination]);

  const handleLocationSelect = (place: PlaceSuggestion | typeof SAVED_LOCATIONS[0]) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    navigation.navigate("RideConfirmation", {
      pickup: {
        address: pickupLocation,
        latitude: currentCoords.latitude || 0,
        longitude: currentCoords.longitude || 0,
      },
      destination: {
        address: "address" in place ? place.address : place.name,
        latitude: place.latitude || 0,
        longitude: place.longitude || 0,
      },
    });
  };

  const showSearchResults = destination.length >= 1 && searchResults.length > 0;

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Animated.View entering={FadeIn} style={styles.inputsContainer}>
        <View style={[styles.inputRow, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.inputIndicator}>
            <View style={[styles.pickupDot, { backgroundColor: theme.accent }]} />
            <View style={[styles.connectingLine, { backgroundColor: theme.textTertiary }]} />
            <View style={[styles.destinationDot, { backgroundColor: theme.text }]} />
          </View>
          <View style={styles.inputFields}>
            <View style={styles.inputWithIcon}>
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color={theme.accent} style={styles.inputLoader} />
              ) : null}
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Pickup location"
                placeholderTextColor={theme.textSecondary}
                value={pickupLocation}
                onChangeText={setPickupLocation}
              />
            </View>
            <View style={[styles.inputDivider, { backgroundColor: theme.backgroundSecondary }]} />
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Where to?"
                placeholderTextColor={theme.textSecondary}
                value={destination}
                onChangeText={setDestination}
                autoFocus
              />
              {destination.length > 0 ? (
                <Pressable onPress={() => setDestination("")} style={styles.clearButton}>
                  <Feather name="x-circle" size={18} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </Animated.View>

      {showSearchResults ? (
        <Animated.View entering={FadeInDown.springify()} style={styles.section}>
          <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            SUGGESTIONS
          </ThemedText>
          <View style={[styles.resultsCard, { backgroundColor: theme.backgroundDefault }]}>
            {searchResults.map((place, index) => (
              <Pressable
                key={place.id}
                onPress={() => handleLocationSelect(place)}
                style={({ pressed }) => [
                  styles.resultRow,
                  { backgroundColor: pressed ? theme.backgroundSecondary : "transparent" },
                  index < searchResults.length - 1 && [styles.resultBorder, { borderBottomColor: theme.backgroundSecondary }],
                ]}
              >
                <View style={[styles.resultIcon, { backgroundColor: theme.accent + "20" }]}>
                  <Feather name={place.icon} size={16} color={theme.accent} />
                </View>
                <View style={styles.resultText}>
                  <ThemedText type="body">{place.name}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {place.address}
                  </ThemedText>
                </View>
                <Feather name="arrow-up-left" size={16} color={theme.textTertiary} />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ) : (
        <>
          <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
            <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              SAVED PLACES
            </ThemedText>
            {SAVED_LOCATIONS.map((location) => (
              <LocationRow
                key={location.id}
                icon={location.icon}
                iconColor={location.iconColor}
                title={location.name}
                subtitle={location.address}
                onPress={() => handleLocationSelect(location)}
              />
            ))}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              QUICK ACCESS
            </ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScroll}
            >
              {POPULAR_DESTINATIONS.map((place, index) => (
                <Pressable
                  key={place.id}
                  onPress={() => handleLocationSelect(place)}
                  style={({ pressed }) => [
                    styles.popularCard,
                    { 
                      backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault,
                    },
                  ]}
                >
                  <View style={[styles.popularIcon, { backgroundColor: theme.accent + "15" }]}>
                    <Feather name={place.icon} size={16} color={theme.accent} />
                  </View>
                  <ThemedText type="caption" numberOfLines={1} style={styles.popularName}>
                    {place.name}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textTertiary, fontSize: 11 }}>
                    {place.distance}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              RECENT
            </ThemedText>
            <LocationRow
              icon="clock"
              title="Central Station"
              subtitle="Main Railway Hub"
              onPress={() => handleLocationSelect(SEARCHABLE_PLACES[3])}
            />
            <LocationRow
              icon="clock"
              title="City Mall"
              subtitle="Shopping Complex"
              onPress={() => handleLocationSelect(SEARCHABLE_PLACES[4])}
            />
          </Animated.View>
        </>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputsContainer: {
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  inputIndicator: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    width: 20,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  connectingLine: {
    width: 2,
    flex: 1,
    marginVertical: Spacing.xs,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  inputFields: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    paddingHorizontal: Spacing.sm,
  },
  inputLoader: {
    marginRight: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  inputDivider: {
    height: 1,
    marginHorizontal: Spacing.sm,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
    fontWeight: "600",
    fontSize: 11,
  },
  resultsCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  resultBorder: {
    borderBottomWidth: 1,
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    flex: 1,
    gap: 1,
  },
  popularScroll: {
    gap: Spacing.sm,
  },
  popularCard: {
    width: 72,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: 4,
  },
  popularIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  popularName: {
    fontWeight: "500",
    fontSize: 12,
    textAlign: "center",
  },
});
