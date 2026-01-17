import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, TextInput, Platform, Pressable, ActivityIndicator } from "react-native";
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
  { id: "pop-1", name: "Airport", address: "International Airport Terminal", type: "popular", distance: "25 min", latitude: 0, longitude: 0 },
  { id: "pop-2", name: "City Center", address: "Downtown Main Square", type: "popular", distance: "15 min", latitude: 0, longitude: 0 },
  { id: "pop-3", name: "Shopping Mall", address: "Grand Shopping Center", type: "popular", distance: "10 min", latitude: 0, longitude: 0 },
  { id: "pop-4", name: "Train Station", address: "Central Railway Station", type: "popular", distance: "12 min", latitude: 0, longitude: 0 },
  { id: "pop-5", name: "Hospital", address: "City Medical Center", type: "popular", distance: "8 min", latitude: 0, longitude: 0 },
];

const SEARCHABLE_PLACES: PlaceSuggestion[] = [
  { id: "s-1", name: "Airport Terminal 1", address: "Departure & Arrivals, Terminal 1", type: "search", latitude: 0, longitude: 0 },
  { id: "s-2", name: "Airport Terminal 2", address: "International Flights, Terminal 2", type: "search", latitude: 0, longitude: 0 },
  { id: "s-3", name: "Central Park", address: "Recreation Area, Downtown", type: "search", latitude: 0, longitude: 0 },
  { id: "s-4", name: "Central Station", address: "Main Railway Hub", type: "search", latitude: 0, longitude: 0 },
  { id: "s-5", name: "City Mall", address: "Shopping & Entertainment Complex", type: "search", latitude: 0, longitude: 0 },
  { id: "s-6", name: "Convention Center", address: "Business & Events Venue", type: "search", latitude: 0, longitude: 0 },
  { id: "s-7", name: "Downtown Plaza", address: "City Center Square", type: "search", latitude: 0, longitude: 0 },
  { id: "s-8", name: "Grand Hotel", address: "5-Star Luxury Accommodation", type: "search", latitude: 0, longitude: 0 },
  { id: "s-9", name: "Hospital Emergency", address: "24/7 Medical Services", type: "search", latitude: 0, longitude: 0 },
  { id: "s-10", name: "Museum of Art", address: "Cultural & Art Exhibition", type: "search", latitude: 0, longitude: 0 },
  { id: "s-11", name: "National Stadium", address: "Sports & Events Arena", type: "search", latitude: 0, longitude: 0 },
  { id: "s-12", name: "Opera House", address: "Performing Arts Theater", type: "search", latitude: 0, longitude: 0 },
  { id: "s-13", name: "Restaurant Row", address: "Dining & Nightlife District", type: "search", latitude: 0, longitude: 0 },
  { id: "s-14", name: "University Campus", address: "Educational Institution", type: "search", latitude: 0, longitude: 0 },
  { id: "s-15", name: "Beach Resort", address: "Coastal Recreation Area", type: "search", latitude: 0, longitude: 0 },
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
    if (destination.length < 2) return [];
    const query = destination.toLowerCase();
    return SEARCHABLE_PLACES.filter(
      (place) =>
        place.name.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query)
    ).slice(0, 5);
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
        address: place.address,
        latitude: place.latitude || 0,
        longitude: place.longitude || 0,
      },
    });
  };

  const showSearchResults = destination.length >= 2 && searchResults.length > 0;

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
            SEARCH RESULTS
          </ThemedText>
          <View style={[styles.resultsCard, { backgroundColor: theme.backgroundDefault }]}>
            {searchResults.map((place, index) => (
              <Animated.View key={place.id} entering={FadeInDown.delay(index * 50)}>
                <Pressable
                  onPress={() => handleLocationSelect(place)}
                  style={({ pressed }) => [
                    styles.resultRow,
                    { backgroundColor: pressed ? theme.backgroundSecondary : "transparent" },
                    index < searchResults.length - 1 && [styles.resultBorder, { borderBottomColor: theme.backgroundSecondary }],
                  ]}
                >
                  <View style={[styles.resultIcon, { backgroundColor: theme.accent + "20" }]}>
                    <Feather name="map-pin" size={16} color={theme.accent} />
                  </View>
                  <View style={styles.resultText}>
                    <ThemedText type="body">{place.name}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                      {place.address}
                    </ThemedText>
                  </View>
                  <Feather name="arrow-up-left" size={18} color={theme.textTertiary} />
                </Pressable>
              </Animated.View>
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
              POPULAR DESTINATIONS
            </ThemedText>
            <View style={[styles.popularGrid]}>
              {POPULAR_DESTINATIONS.map((place, index) => (
                <Animated.View key={place.id} entering={FadeInUp.delay(250 + index * 50)}>
                  <Pressable
                    onPress={() => handleLocationSelect(place)}
                    style={({ pressed }) => [
                      styles.popularCard,
                      { 
                        backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundDefault,
                        borderColor: theme.backgroundSecondary,
                      },
                    ]}
                  >
                    <View style={[styles.popularIcon, { backgroundColor: theme.accent + "15" }]}>
                      <Feather 
                        name={
                          place.name.includes("Airport") ? "navigation" :
                          place.name.includes("Mall") ? "shopping-bag" :
                          place.name.includes("Station") ? "map" :
                          place.name.includes("Hospital") ? "plus-circle" :
                          "map-pin"
                        } 
                        size={18} 
                        color={theme.accent} 
                      />
                    </View>
                    <ThemedText type="small" numberOfLines={1}>{place.name}</ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textTertiary }}>
                      {place.distance}
                    </ThemedText>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <View style={[styles.tipCard, { backgroundColor: theme.accent + "10", borderColor: theme.accent + "30" }]}>
              <Feather name="info" size={18} color={theme.accent} />
              <View style={styles.tipText}>
                <ThemedText type="small" style={{ color: theme.accent }}>
                  Pro tip
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Start typing to see location suggestions. Save frequent places for quick access.
                </ThemedText>
              </View>
            </View>
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
    marginBottom: Spacing.lg,
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
    fontSize: 17,
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
    letterSpacing: 1,
    fontWeight: "600",
  },
  resultsCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  resultBorder: {
    borderBottomWidth: 1,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  popularCard: {
    width: (Spacing.lg * 2 + 100),
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  popularIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    gap: 4,
  },
});
