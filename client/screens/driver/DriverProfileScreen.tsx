import React from "react";
import { StyleSheet, View, ScrollView, Platform, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DriverStackParamList } from "@/navigation/DriverStackNavigator";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";

type DriverProfileScreenNavigationProp = NativeStackNavigationProp<
  DriverStackParamList,
  "DriverProfile"
>;

interface Props {
  navigation: DriverProfileScreenNavigationProp;
}

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showBadge?: boolean;
  danger?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, showBadge, danger }: MenuItemProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? theme.backgroundSecondary : "transparent" },
      ]}
    >
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: danger ? theme.error + "20" : theme.backgroundSecondary },
        ]}
      >
        <Feather name={icon} size={20} color={danger ? theme.error : theme.text} />
      </View>
      <View style={styles.menuTextContainer}>
        <ThemedText type="body" style={{ color: danger ? theme.error : theme.text }}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {showBadge ? (
        <View style={[styles.badge, { backgroundColor: theme.error }]} />
      ) : null}
      <Feather name="chevron-right" size={20} color={theme.textTertiary} />
    </Pressable>
  );
}

export default function DriverProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { setMode, toggleDebugMode } = useAppStore();
  const { user, driverProfile, logout } = useAuthStore();

  const { data: driverRides = [] } = useQuery<any[]>({
    queryKey: ["/api/drivers", user?.id, "rides"],
    enabled: !!user?.id,
  });

  const completedTrips = driverRides.filter(r => r.status === "completed").length;
  const driverRating = driverProfile?.driverRating ? Number(driverProfile.driverRating).toFixed(2) : "5.00";

  const handleSwitchToRider = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setMode("rider");
  };

  const handleOpenDebugMenu = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    toggleDebugMode();
  };

  const handleSignOut = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    logout();
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
      <Animated.View entering={FadeInDown.delay(100)}>
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="user" size={32} color={theme.textSecondary} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <ThemedText type="h2">{user?.fullName || "Driver"}</ThemedText>
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Feather name="star" size={14} color={theme.accent} />
                  <ThemedText type="body">{driverRating}</ThemedText>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.textTertiary }]} />
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {completedTrips} trip{completedTrips !== 1 ? "s" : ""}
                </ThemedText>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150)} style={styles.achievementRow}>
        <View style={[styles.achievementCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={[styles.achievementIcon, { backgroundColor: theme.accent + "20" }]}>
            <Feather name="award" size={20} color={theme.accent} />
          </View>
          <ThemedText type="caption">Gold Driver</ThemedText>
        </View>
        <View style={[styles.achievementCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={[styles.achievementIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="shield" size={20} color={theme.success} />
          </View>
          <ThemedText type="caption">Safe Driver</ThemedText>
        </View>
        <View style={[styles.achievementCard, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={[styles.achievementIcon, { backgroundColor: "#4A90D9" + "20" }]}>
            <Feather name="zap" size={20} color="#4A90D9" />
          </View>
          <ThemedText type="caption">Top Rated</ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          VEHICLE
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="truck"
            title={driverProfile ? `${driverProfile.vehicleMake} ${driverProfile.vehicleModel}` : "No vehicle"}
            subtitle={driverProfile ? `${driverProfile.vehicleYear || ""} ${driverProfile.vehicleColor} ${driverProfile.vehiclePlate}`.trim() : ""}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="file-text"
            title="Documents"
            subtitle={driverProfile?.isVerified ? "All up to date" : "Pending verification"}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          PREFERENCES
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="navigation"
            title="Navigation"
            subtitle="Apple Maps"
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="sliders"
            title="Trip Preferences"
            subtitle="All trip types enabled"
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="bell"
            title="Notifications"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          SAFETY
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="shield"
            title="Safety Center"
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="users"
            title="Emergency Contacts"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ACCOUNT
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="credit-card"
            title="Payment Settings"
            subtitle="Direct deposit to ****4242"
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="help-circle"
            title="Help & Support"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="log-out"
            title="Sign Out"
            danger
            onPress={handleSignOut}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450)} style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          DEVELOPER
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="tool"
            title="Debug Menu"
            subtitle="Switch between apps"
            onPress={handleOpenDebugMenu}
          />
        </View>
      </Animated.View>

      <ThemedText type="caption" style={[styles.version, { color: theme.textTertiary }]}>
        RideX Driver v1.0.0
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 14,
  },
  achievementRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  achievementCard: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.lg,
    letterSpacing: 1,
  },
  menuGroup: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
    gap: 2,
  },
  menuDivider: {
    height: 1,
    marginLeft: 68,
  },
  badge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
