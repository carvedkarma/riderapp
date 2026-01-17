import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
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

const EARNINGS_DATA = {
  today: {
    total: 156.75,
    trips: 8,
    hours: 5.5,
    tips: 24.50,
    platformFee: 31.35,
  },
  week: {
    total: 892.40,
    trips: 47,
    hours: 32,
    tips: 142.80,
    platformFee: 178.48,
  },
  month: {
    total: 3245.60,
    trips: 182,
    hours: 124,
    tips: 512.30,
    platformFee: 649.12,
  },
};

const TRIP_HISTORY = [
  { id: "1", time: "2:30 PM", pickup: "123 Main St", dropoff: "456 Market Ave", fare: 18.50, tip: 3.00 },
  { id: "2", time: "1:45 PM", pickup: "789 Oak Blvd", dropoff: "321 Pine St", fare: 12.25, tip: 2.00 },
  { id: "3", time: "12:15 PM", pickup: "Airport Terminal 1", dropoff: "Downtown Hotel", fare: 42.00, tip: 8.00 },
  { id: "4", time: "11:00 AM", pickup: "Central Station", dropoff: "Tech Park", fare: 15.75, tip: 2.50 },
  { id: "5", time: "10:20 AM", pickup: "Riverside Dr", dropoff: "Shopping Mall", fare: 9.50, tip: 0 },
];

export default function DriverEarningsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState(0);
  const periods = ["Today", "Week", "Month"];
  const periodKeys = ["today", "week", "month"] as const;
  const data = EARNINGS_DATA[periodKeys[selectedPeriod]];

  const handlePeriodChange = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedPeriod(index);
  };

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
          ${data.total.toFixed(2)}
        </ThemedText>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Feather name="navigation" size={18} color={theme.accent} />
            <ThemedText type="h3">{data.trips}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Trips</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="clock" size={18} color={theme.accent} />
            <ThemedText type="h3">{data.hours}h</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Online</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Feather name="trending-up" size={18} color={theme.success} />
            <ThemedText type="h3">${(data.total / data.hours).toFixed(0)}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>Per Hour</ThemedText>
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
          <ThemedText type="body">${(data.total + data.platformFee).toFixed(2)}</ThemedText>
        </View>
        
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLabel}>
            <View style={[styles.breakdownDot, { backgroundColor: theme.accent }]} />
            <ThemedText type="body">Tips</ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.success }}>+${data.tips.toFixed(2)}</ThemedText>
        </View>
        
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLabel}>
            <View style={[styles.breakdownDot, { backgroundColor: theme.error }]} />
            <ThemedText type="body">Platform fee</ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.error }}>-${data.platformFee.toFixed(2)}</ThemedText>
        </View>
        
        <View style={[styles.breakdownTotal, { borderTopColor: theme.backgroundTertiary }]}>
          <ThemedText type="h4">Net earnings</ThemedText>
          <ThemedText type="h4" style={{ color: theme.success }}>${data.total.toFixed(2)}</ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)}>
        <ThemedText type="h4" style={styles.historyTitle}>Recent Trips</ThemedText>
        
        {TRIP_HISTORY.map((trip, index) => (
          <Animated.View
            key={trip.id}
            entering={FadeInDown.delay(350 + index * 50)}
          >
            <Pressable style={[styles.tripCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={styles.tripTime}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>{trip.time}</ThemedText>
              </View>
              <View style={styles.tripInfo}>
                <View style={styles.tripRoute}>
                  <View style={[styles.routeDot, { backgroundColor: theme.accent }]} />
                  <ThemedText type="small" numberOfLines={1}>{trip.pickup}</ThemedText>
                </View>
                <View style={styles.tripRoute}>
                  <View style={[styles.routeDot, { backgroundColor: theme.text }]} />
                  <ThemedText type="small" numberOfLines={1}>{trip.dropoff}</ThemedText>
                </View>
              </View>
              <View style={styles.tripEarnings}>
                <ThemedText type="h4">${trip.fare.toFixed(2)}</ThemedText>
                {trip.tip > 0 ? (
                  <ThemedText type="caption" style={{ color: theme.success }}>+${trip.tip.toFixed(2)} tip</ThemedText>
                ) : null}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentControl: {
    height: 36,
    marginBottom: Spacing.xl,
  },
  earningsCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
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
    marginTop: Spacing.md,
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  historyTitle: {
    marginBottom: Spacing.md,
  },
  tripCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  tripTime: {
    width: 60,
  },
  tripInfo: {
    flex: 1,
    gap: 4,
  },
  tripRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tripEarnings: {
    alignItems: "flex-end",
    gap: 2,
  },
});
