import React, { useState, useMemo } from "react";
import { StyleSheet, View, ScrollView, Platform, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DriverStackParamList } from "@/navigation/DriverStackNavigator";

type DriverEarningsScreenNavigationProp = NativeStackNavigationProp<
  DriverStackParamList,
  "DriverEarnings"
>;

interface Props {
  navigation: DriverEarningsScreenNavigationProp;
}

interface RideData {
  id: string;
  pickupAddress: string;
  destinationAddress: string;
  status: string;
  completedAt: string | null;
  actualFare: string | null;
  driverEarnings: string | null;
  platformFee: string | null;
  createdAt: string;
}

export default function DriverEarningsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuthStore();

  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const periods = ["Today", "Week", "Month"];

  const { data: rides = [], isLoading } = useQuery<RideData[]>({
    queryKey: ["/api/drivers", user?.id, "rides"],
    enabled: !!user?.id,
  });

  const filteredData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const completedRides = rides.filter(r => r.status === "completed" && r.completedAt);

    let filteredRides: RideData[];
    if (selectedPeriod === 0) {
      filteredRides = completedRides.filter(r => new Date(r.completedAt!).toDateString() === today.toDateString());
    } else if (selectedPeriod === 1) {
      filteredRides = completedRides.filter(r => new Date(r.completedAt!) >= weekAgo);
    } else {
      filteredRides = completedRides.filter(r => new Date(r.completedAt!) >= monthAgo);
    }

    const totalEarnings = filteredRides.reduce((sum, r) => sum + Number(r.driverEarnings || 0), 0);
    const totalFees = filteredRides.reduce((sum, r) => sum + Number(r.platformFee || 0), 0);
    const totalFares = filteredRides.reduce((sum, r) => sum + Number(r.actualFare || 0), 0);

    return {
      total: totalEarnings,
      trips: filteredRides.length,
      platformFee: totalFees,
      fares: totalFares,
      recentTrips: filteredRides.slice(0, 10),
    };
  }, [rides, selectedPeriod]);

  const handlePeriodChange = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedPeriod(index);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <ThemedText type="body" style={{ marginTop: Spacing.lg }}>Loading earnings...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <SegmentedControl
        values={periods}
        selectedIndex={selectedPeriod}
        onChange={(event) => handlePeriodChange(event.nativeEvent.selectedSegmentIndex)}
        style={styles.segmentControl}
        tintColor={theme.accent}
        fontStyle={{ color: theme.textSecondary }}
        activeFontStyle={{ color: "#000000" }}
        backgroundColor={theme.backgroundSecondary}
      />

      <Animated.View entering={FadeInDown.delay(100)} style={[styles.earningsCard, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          TOTAL EARNINGS
        </ThemedText>
        <ThemedText type="hero" style={[styles.earningsAmount, { color: theme.success }]}>
          ${filteredData.total.toFixed(2)}
        </ThemedText>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Feather name="navigation" size={18} color={theme.accent} />
            <ThemedText type="h3">{filteredData.trips}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Trips</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="dollar-sign" size={18} color={theme.accent} />
            <ThemedText type="h3">${filteredData.fares.toFixed(0)}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Fares</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="trending-up" size={18} color={theme.success} />
            <ThemedText type="h3">
              ${filteredData.trips > 0 ? (filteredData.total / filteredData.trips).toFixed(0) : "0"}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Per Trip</ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={[styles.breakdownCard, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="h4" style={styles.sectionTitle}>Earnings Breakdown</ThemedText>
        
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLabel}>
            <View style={[styles.breakdownDot, { backgroundColor: theme.success }]} />
            <ThemedText type="body">Trip fares</ThemedText>
          </View>
          <ThemedText type="body">${filteredData.fares.toFixed(2)}</ThemedText>
        </View>
        
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLabel}>
            <View style={[styles.breakdownDot, { backgroundColor: theme.error }]} />
            <ThemedText type="body">Platform fee (20%)</ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.error }}>-${filteredData.platformFee.toFixed(2)}</ThemedText>
        </View>
        
        <View style={[styles.breakdownRow, styles.breakdownTotal, { borderTopColor: theme.backgroundTertiary }]}>
          <ThemedText type="h4">Your earnings</ThemedText>
          <ThemedText type="h4" style={{ color: theme.success }}>${filteredData.total.toFixed(2)}</ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)}>
        <ThemedText type="h4" style={styles.sectionTitle}>Recent Trips</ThemedText>
        
        {filteredData.recentTrips.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="truck" size={32} color={theme.textTertiary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              No trips yet for this period
            </ThemedText>
          </View>
        ) : (
          filteredData.recentTrips.map((trip, index) => (
            <Animated.View
              key={trip.id}
              entering={FadeInDown.delay(400 + index * 50)}
              style={[styles.tripCard, { backgroundColor: theme.backgroundSecondary }]}
            >
              <View style={styles.tripInfo}>
                <ThemedText type="h4">${Number(trip.driverEarnings || 0).toFixed(2)}</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {trip.completedAt ? formatTime(trip.completedAt) : ""}
                </ThemedText>
              </View>
              <View style={styles.tripRoute}>
                <View style={styles.tripLocation}>
                  <View style={[styles.locationDot, { backgroundColor: theme.accent }]} />
                  <ThemedText type="caption" numberOfLines={1} style={{ flex: 1 }}>
                    {trip.pickupAddress}
                  </ThemedText>
                </View>
                <View style={styles.tripLocation}>
                  <View style={[styles.locationDot, { backgroundColor: theme.text }]} />
                  <ThemedText type="caption" numberOfLines={1} style={{ flex: 1, color: theme.textSecondary }}>
                    {trip.destinationAddress}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  segmentControl: {
    marginBottom: Spacing.xl,
  },
  earningsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  earningsAmount: {
    fontSize: 48,
    marginVertical: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  breakdownCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  breakdownLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownTotal: {
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    marginBottom: 0,
  },
  emptyState: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  tripCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  tripInfo: {
    alignItems: "center",
    minWidth: 70,
  },
  tripRoute: {
    flex: 1,
    gap: Spacing.xs,
  },
  tripLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  locationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
