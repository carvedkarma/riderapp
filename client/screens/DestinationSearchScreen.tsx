import React, { useState } from "react";
import { StyleSheet, View, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

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

const SAVED_LOCATIONS = [
  {
    id: "1",
    name: "Home",
    address: "123 Main Street, San Francisco, CA",
    icon: "home" as const,
    iconColor: "#007AFF",
  },
  {
    id: "2",
    name: "Work",
    address: "456 Market Street, San Francisco, CA",
    icon: "briefcase" as const,
    iconColor: "#34C759",
  },
];

const RECENT_LOCATIONS = [
  {
    id: "3",
    name: "Golden Gate Park",
    address: "Golden Gate Park, San Francisco, CA",
    icon: "clock" as const,
  },
  {
    id: "4",
    name: "Fisherman's Wharf",
    address: "Fisherman's Wharf, San Francisco, CA",
    icon: "clock" as const,
  },
  {
    id: "5",
    name: "Union Square",
    address: "Union Square, San Francisco, CA",
    icon: "clock" as const,
  },
];

export default function DestinationSearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [pickupLocation, setPickupLocation] = useState("Current Location");
  const [destination, setDestination] = useState("");

  const handleLocationSelect = (location: typeof SAVED_LOCATIONS[0]) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    navigation.navigate("RideConfirmation", {
      pickup: {
        address: "Current Location",
        latitude: 37.78825,
        longitude: -122.4324,
      },
      destination: {
        address: location.address,
        latitude: 37.7749 + Math.random() * 0.02,
        longitude: -122.4194 + Math.random() * 0.02,
      },
    });
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.inputsContainer}>
        <View style={[styles.inputRow, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.inputIndicator}>
            <View style={[styles.pickupDot, { backgroundColor: theme.accent }]} />
            <View style={[styles.connectingLine, { backgroundColor: theme.textTertiary }]} />
            <View style={[styles.destinationDot, { backgroundColor: theme.text }]} />
          </View>
          <View style={styles.inputFields}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Pickup location"
              placeholderTextColor={theme.textSecondary}
              value={pickupLocation}
              onChangeText={setPickupLocation}
            />
            <View style={[styles.inputDivider, { backgroundColor: theme.backgroundSecondary }]} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Where to?"
              placeholderTextColor={theme.textSecondary}
              value={destination}
              onChangeText={setDestination}
              autoFocus
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
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
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          RECENT
        </ThemedText>
        {RECENT_LOCATIONS.map((location) => (
          <LocationRow
            key={location.id}
            icon={location.icon}
            title={location.name}
            subtitle={location.address}
            onPress={() => handleLocationSelect(location)}
          />
        ))}
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputsContainer: {
    marginBottom: Spacing.xl,
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
  input: {
    height: 44,
    fontSize: 17,
    paddingHorizontal: Spacing.sm,
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
    marginLeft: Spacing.lg,
    letterSpacing: 1,
  },
});
