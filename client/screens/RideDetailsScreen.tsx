import React from "react";
import { StyleSheet, View, ScrollView, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type RideDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RideDetails"
>;

type RideDetailsScreenRouteProp = RouteProp<RootStackParamList, "RideDetails">;

interface Props {
  navigation: RideDetailsScreenNavigationProp;
  route: RideDetailsScreenRouteProp;
}

const MOCK_RIDE = {
  id: "1",
  date: "January 17, 2026",
  time: "2:30 PM",
  pickupAddress: "123 Main Street, San Francisco, CA",
  destinationAddress: "Golden Gate Park, San Francisco, CA",
  fare: "$18.75",
  distance: "5.2 mi",
  duration: "18 min",
  driver: {
    name: "Michael Chen",
    rating: "4.9",
    vehicle: "White Tesla Model 3",
    plate: "7ABC123",
  },
  breakdown: [
    { label: "Base fare", amount: "$2.50" },
    { label: "Distance (5.2 mi)", amount: "$10.40" },
    { label: "Time (18 min)", amount: "$3.60" },
    { label: "Service fee", amount: "$2.25" },
  ],
  tip: "$2.00",
  total: "$20.75",
};

export default function RideDetailsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleGetReceipt = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReportIssue = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {MOCK_RIDE.date} at {MOCK_RIDE.time}
        </ThemedText>
        <ThemedText type="hero" style={{ color: theme.accent }}>
          {MOCK_RIDE.total}
        </ThemedText>
      </View>

      <GlassCard style={styles.routeCard}>
        <View style={styles.routeContainer}>
          <View style={styles.routeIndicator}>
            <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
            <View style={[styles.routeLine, { backgroundColor: theme.textTertiary }]} />
            <View style={[styles.routeSquare, { backgroundColor: theme.text }]} />
          </View>
          <View style={styles.routeAddresses}>
            <View style={styles.addressItem}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                PICKUP
              </ThemedText>
              <ThemedText type="body">{MOCK_RIDE.pickupAddress}</ThemedText>
            </View>
            <View style={styles.addressItem}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                DROPOFF
              </ThemedText>
              <ThemedText type="body">{MOCK_RIDE.destinationAddress}</ThemedText>
            </View>
          </View>
        </View>
        <View style={[styles.tripStats, { borderTopColor: theme.backgroundSecondary }]}>
          <View style={styles.statItem}>
            <Feather name="map" size={16} color={theme.textSecondary} />
            <ThemedText type="small">{MOCK_RIDE.distance}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="clock" size={16} color={theme.textSecondary} />
            <ThemedText type="small">{MOCK_RIDE.duration}</ThemedText>
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.driverCard}>
        <View style={styles.driverHeader}>
          <Image
            source={require("../../assets/images/avatar-default.png")}
            style={styles.driverAvatar}
          />
          <View style={styles.driverInfo}>
            <ThemedText type="h3">{MOCK_RIDE.driver.name}</ThemedText>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={14} color={theme.accent} />
              <ThemedText type="small">{MOCK_RIDE.driver.rating}</ThemedText>
            </View>
          </View>
        </View>
        <View style={[styles.vehicleInfo, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText type="small">{MOCK_RIDE.driver.vehicle}</ThemedText>
          <View style={[styles.plateBadge, { backgroundColor: theme.backgroundTertiary }]}>
            <ThemedText type="h4">{MOCK_RIDE.driver.plate}</ThemedText>
          </View>
        </View>
      </GlassCard>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Fare Breakdown
        </ThemedText>
        <View style={[styles.breakdownCard, { backgroundColor: theme.backgroundDefault }]}>
          {MOCK_RIDE.breakdown.map((item, index) => (
            <View key={index} style={styles.breakdownRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.label}
              </ThemedText>
              <ThemedText type="small">{item.amount}</ThemedText>
            </View>
          ))}
          <View style={[styles.breakdownDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <View style={styles.breakdownRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Tip
            </ThemedText>
            <ThemedText type="small">{MOCK_RIDE.tip}</ThemedText>
          </View>
          <View style={[styles.breakdownDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <View style={styles.breakdownRow}>
            <ThemedText type="h4">Total</ThemedText>
            <ThemedText type="h3" style={{ color: theme.accent }}>
              {MOCK_RIDE.total}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button onPress={handleGetReceipt} variant="secondary" fullWidth>
          Get Receipt
        </Button>
        <Button onPress={handleReportIssue} variant="outline" fullWidth>
          Report an Issue
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  routeCard: {
    marginBottom: Spacing.lg,
  },
  routeContainer: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  routeIndicator: {
    alignItems: "center",
    width: 20,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    flex: 1,
    marginVertical: Spacing.xs,
  },
  routeSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  routeAddresses: {
    flex: 1,
    justifyContent: "space-between",
    gap: Spacing.xl,
  },
  addressItem: {
    gap: Spacing.xs,
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing["3xl"],
    paddingTop: Spacing.lg,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  driverCard: {
    marginBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  driverHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverInfo: {
    gap: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  vehicleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  plateBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  breakdownCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  actions: {
    gap: Spacing.md,
  },
});
