import React, { useState } from "react";
import { StyleSheet, View, Platform, TextInput, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DriverStackParamList } from "@/navigation/DriverStackNavigator";

type DriverOnboardingScreenNavigationProp = NativeStackNavigationProp<
  DriverStackParamList,
  "DriverOnboarding"
>;

interface Props {
  navigation: DriverOnboardingScreenNavigationProp;
}

const vehicleTiers = [
  { id: "economy", label: "Economy", icon: "truck" as const },
  { id: "comfort", label: "Comfort", icon: "truck" as const },
  { id: "premium", label: "Premium", icon: "truck" as const },
  { id: "luxury", label: "Luxury", icon: "award" as const },
] as const;

export default function DriverOnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, setDriverProfile } = useAuthStore();
  
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("economy");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!vehicleMake.trim() || !vehicleModel.trim() || !vehicleColor.trim() || !vehiclePlate.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!user) {
      setError("Please log in first");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);
    setError("");

    try {
      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission is required for driving");
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(new URL("/api/drivers/profile", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          vehicleMake: vehicleMake.trim(),
          vehicleModel: vehicleModel.trim(),
          vehicleYear: vehicleYear ? parseInt(vehicleYear) : null,
          vehicleColor: vehicleColor.trim(),
          vehiclePlate: vehiclePlate.trim().toUpperCase(),
          vehicleTier: selectedTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register as driver");
        return;
      }

      setDriverProfile(data);
      navigation.replace("DriverHome");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}>
            <Feather name="truck" size={32} color={theme.accent} />
          </View>
          <ThemedText type="h2">Become a Driver</ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            Register your vehicle to start earning with RideX
          </ThemedText>
        </View>

        <GlassCard style={styles.formCard}>
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}>
              <Feather name="alert-circle" size={16} color={theme.error} />
              <ThemedText type="caption" style={{ color: theme.error, flex: 1 }}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            VEHICLE DETAILS
          </ThemedText>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, flex: 1 }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Make *"
                placeholderTextColor={theme.textTertiary}
                value={vehicleMake}
                onChangeText={setVehicleMake}
                autoCapitalize="words"
              />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, flex: 1 }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Model *"
                placeholderTextColor={theme.textTertiary}
                value={vehicleModel}
                onChangeText={setVehicleModel}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, flex: 1 }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Year"
                placeholderTextColor={theme.textTertiary}
                value={vehicleYear}
                onChangeText={setVehicleYear}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, flex: 1 }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Color *"
                placeholderTextColor={theme.textTertiary}
                value={vehicleColor}
                onChangeText={setVehicleColor}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="License Plate *"
              placeholderTextColor={theme.textTertiary}
              value={vehiclePlate}
              onChangeText={setVehiclePlate}
              autoCapitalize="characters"
            />
          </View>

          <ThemedText type="caption" style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: Spacing.lg }]}>
            VEHICLE TIER
          </ThemedText>

          <View style={styles.tierGrid}>
            {vehicleTiers.map((tier) => (
              <Pressable
                key={tier.id}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                  setSelectedTier(tier.id);
                }}
                style={[
                  styles.tierCard,
                  {
                    backgroundColor: selectedTier === tier.id ? theme.accent + "20" : theme.backgroundSecondary,
                    borderColor: selectedTier === tier.id ? theme.accent : "transparent",
                  },
                ]}
              >
                <Feather
                  name={tier.icon}
                  size={20}
                  color={selectedTier === tier.id ? theme.accent : theme.textSecondary}
                />
                <ThemedText
                  type="caption"
                  style={{ color: selectedTier === tier.id ? theme.accent : theme.text }}
                >
                  {tier.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        <View style={styles.infoCard}>
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1 }}>
            Your vehicle will be reviewed before you can start accepting rides. This usually takes less than 24 hours.
          </ThemedText>
        </View>

        <Button onPress={handleRegister} fullWidth loading={isLoading}>
          Register Vehicle
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  input: {
    fontSize: 16,
  },
  tierGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tierCard: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
});
