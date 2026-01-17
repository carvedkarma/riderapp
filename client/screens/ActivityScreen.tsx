import React, { useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as Haptics from "expo-haptics";

import { RideHistoryCard } from "@/components/RideHistoryCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { MainTabParamList } from "@/navigation/MainTabNavigator";

type ActivityScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "ActivityTab">,
  NativeStackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: ActivityScreenNavigationProp;
}

const MOCK_RIDES = [
  {
    id: "1",
    date: "Today, 2:30 PM",
    pickupAddress: "123 Main Street, San Francisco",
    destinationAddress: "Golden Gate Park, SF",
    fare: "$18.75",
    driverName: "Michael Chen",
    status: "completed",
  },
  {
    id: "2",
    date: "Yesterday, 9:15 AM",
    pickupAddress: "456 Market Street, SF",
    destinationAddress: "SFO Airport Terminal 2",
    fare: "$45.50",
    driverName: "Sarah Johnson",
    status: "completed",
  },
  {
    id: "3",
    date: "Jan 15, 6:45 PM",
    pickupAddress: "Fisherman's Wharf, SF",
    destinationAddress: "Union Square, SF",
    fare: "$12.25",
    driverName: "David Park",
    status: "completed",
  },
];

const MOCK_SCHEDULED = [
  {
    id: "4",
    date: "Tomorrow, 8:00 AM",
    pickupAddress: "123 Main Street, San Francisco",
    destinationAddress: "SFO Airport Terminal 1",
    fare: "$42.00",
    driverName: "To be assigned",
    status: "pending",
  },
];

export default function ActivityScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const data = selectedIndex === 0 ? MOCK_RIDES : MOCK_SCHEDULED;

  const handleSegmentChange = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedIndex(index);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleRidePress = (rideId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("RideDetails", { rideId });
  };

  const renderItem = ({ item }: { item: typeof MOCK_RIDES[0] }) => (
    <RideHistoryCard ride={item} onPress={() => handleRidePress(item.id)} />
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-activity.png")}
      title={selectedIndex === 0 ? "No rides yet" : "No scheduled rides"}
      description={
        selectedIndex === 0
          ? "Your ride history will appear here"
          : "Schedule a ride for later and it will show up here"
      }
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.segmentContainer,
          {
            paddingTop: headerHeight + Spacing.md,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <SegmentedControl
          values={["History", "Scheduled"]}
          selectedIndex={selectedIndex}
          onChange={(event) =>
            handleSegmentChange(event.nativeEvent.selectedSegmentIndex)
          }
          style={styles.segmentedControl}
          tintColor={theme.accent}
          fontStyle={{ color: theme.textSecondary }}
          activeFontStyle={{ color: "#FFFFFF" }}
        />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          data.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
          />
        }
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  segmentedControl: {
    height: 36,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  separator: {
    height: Spacing.md,
  },
});
