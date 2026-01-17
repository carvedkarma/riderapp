import React from "react";
import { StyleSheet, View, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

export default function SafetyCenterScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleSOS = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
      <View style={styles.header}>
        <ThemedText type="h1">Safety Center</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Your safety is our top priority. Access emergency features and safety tools here.
        </ThemedText>
      </View>

      <View style={styles.sosSection}>
        <SOSButton onPress={handleSOS} />
        <ThemedText type="caption" style={[styles.sosHint, { color: theme.textSecondary }]}>
          Tap to contact emergency services and share your ride details
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Safety Features
        </ThemedText>

        <GlassCard
          style={styles.featureCard}
          onPress={() => {}}
        >
          <View style={[styles.featureIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="share-2" size={24} color={theme.success} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="h4">Share Trip Status</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Let friends and family follow your ride in real-time
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </GlassCard>

        <GlassCard
          style={styles.featureCard}
          onPress={() => {}}
        >
          <View style={[styles.featureIcon, { backgroundColor: theme.accent + "20" }]}>
            <Feather name="phone" size={24} color={theme.accent} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="h4">Emergency Contacts</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Add trusted contacts for quick access in emergencies
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </GlassCard>

        <GlassCard
          style={styles.featureCard}
          onPress={() => {}}
        >
          <View style={[styles.featureIcon, { backgroundColor: theme.mapAccent + "20" }]}>
            <Feather name="shield" size={24} color={theme.mapAccent} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="h4">Verify Your Ride</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Match your driver's details before getting in
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </GlassCard>

        <GlassCard
          style={styles.featureCard}
          onPress={() => {}}
        >
          <View style={[styles.featureIcon, { backgroundColor: theme.warning + "20" }]}>
            <Feather name="flag" size={24} color={theme.warning} />
          </View>
          <View style={styles.featureContent}>
            <ThemedText type="h4">Report an Issue</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Report safety concerns about a trip
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </GlassCard>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Safety Tips
        </ThemedText>

        <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.tipRow}>
            <View style={[styles.tipNumber, { backgroundColor: theme.accent }]}>
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>1</ThemedText>
            </View>
            <View style={styles.tipContent}>
              <ThemedText type="body">Verify your driver</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Check the license plate, car model, and driver photo before entering
              </ThemedText>
            </View>
          </View>

          <View style={styles.tipRow}>
            <View style={[styles.tipNumber, { backgroundColor: theme.accent }]}>
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>2</ThemedText>
            </View>
            <View style={styles.tipContent}>
              <ThemedText type="body">Share your trip</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Use the share feature to let someone know your location
              </ThemedText>
            </View>
          </View>

          <View style={styles.tipRow}>
            <View style={[styles.tipNumber, { backgroundColor: theme.accent }]}>
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>3</ThemedText>
            </View>
            <View style={styles.tipContent}>
              <ThemedText type="body">Sit in the back seat</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                For added safety and personal space
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sosSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
    gap: Spacing.md,
  },
  sosHint: {
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  tipCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.lg,
  },
  tipRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
    gap: Spacing.xs,
  },
});
