import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const SAVED_PLACES = [
  {
    id: "1",
    name: "Home",
    address: "123 Main Street, San Francisco, CA 94102",
    icon: "home" as const,
    iconColor: "#007AFF",
  },
  {
    id: "2",
    name: "Work",
    address: "456 Market Street, San Francisco, CA 94103",
    icon: "briefcase" as const,
    iconColor: "#34C759",
  },
  {
    id: "3",
    name: "Gym",
    address: "789 Fitness Ave, San Francisco, CA 94104",
    icon: "activity" as const,
    iconColor: "#FF9500",
  },
];

export default function SavedPlacesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handlePlacePress = (placeId: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const handleAddPlace = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Saved Places
        </ThemedText>

        {SAVED_PLACES.map((place) => (
          <GlassCard
            key={place.id}
            style={styles.placeItem}
            onPress={() => handlePlacePress(place.id)}
          >
            <View
              style={[
                styles.placeIcon,
                { backgroundColor: place.iconColor + "20" },
              ]}
            >
              <Feather name={place.icon} size={24} color={place.iconColor} />
            </View>
            <View style={styles.placeInfo}>
              <ThemedText type="body">{place.name}</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
                {place.address}
              </ThemedText>
            </View>
            <Pressable
              style={[styles.editButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => {}}
            >
              <Feather name="edit-2" size={16} color={theme.textSecondary} />
            </Pressable>
          </GlassCard>
        ))}

        <Pressable
          style={[styles.addButton, { borderColor: theme.textTertiary }]}
          onPress={handleAddPlace}
        >
          <Feather name="plus" size={24} color={theme.accent} />
          <ThemedText type="body" style={{ color: theme.accent }}>
            Add New Place
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="info" size={20} color={theme.accent} />
        <View style={styles.tipContent}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Saved places help you book rides faster. Tap the edit icon to update an address or change the label.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  placeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  placeInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.lg,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  tipContent: {
    flex: 1,
  },
});
