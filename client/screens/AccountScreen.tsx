import React from "react";
import { StyleSheet, View, Image, Pressable, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/stores/appStore";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RiderStackParamList } from "@/navigation/RiderStackNavigator";

type AccountScreenNavigationProp = NativeStackNavigationProp<
  RiderStackParamList,
  "Account"
>;

interface Props {
  navigation: AccountScreenNavigationProp;
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
        <Feather
          name={icon}
          size={20}
          color={danger ? theme.error : theme.text}
        />
      </View>
      <View style={styles.menuTextContainer}>
        <ThemedText
          type="body"
          style={{ color: danger ? theme.error : theme.text }}
        >
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

export default function AccountScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { toggleDebugMode } = useAppStore();

  const handleOpenDebugMenu = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    toggleDebugMode();
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
      <GlassCard style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <Image
            source={require("../../assets/images/avatar-default.png")}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <ThemedText type="h2">John Doe</ThemedText>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={16} color={theme.accent} />
              <ThemedText type="body">4.9</ThemedText>
            </View>
          </View>
          <Pressable
            style={[styles.editButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => {}}
          >
            <Feather name="edit-2" size={18} color={theme.text} />
          </Pressable>
        </View>
      </GlassCard>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          PAYMENT
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="credit-card"
            title="Payment Methods"
            subtitle="Visa ending in 4242"
            onPress={() => navigation.navigate("PaymentMethods")}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="gift"
            title="Promotions"
            subtitle="2 available"
            onPress={() => {}}
            showBadge
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          PLACES
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="home"
            title="Home"
            subtitle="123 Main Street, San Francisco"
            onPress={() => navigation.navigate("SavedPlaces")}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="briefcase"
            title="Work"
            subtitle="456 Market Street, San Francisco"
            onPress={() => navigation.navigate("SavedPlaces")}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="map-pin"
            title="Saved Places"
            onPress={() => navigation.navigate("SavedPlaces")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          SAFETY
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="shield"
            title="Safety Center"
            onPress={() => navigation.navigate("SafetyCenter")}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="users"
            title="Emergency Contacts"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          SETTINGS
        </ThemedText>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="bell"
            title="Notifications"
            onPress={() => {}}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="help-circle"
            title="Help & Support"
            onPress={() => {}}
          />
          <View style={[styles.menuDivider, { backgroundColor: theme.backgroundSecondary }]} />
          <MenuItem
            icon="info"
            title="About"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.menuGroup, { backgroundColor: theme.backgroundDefault }]}>
          <MenuItem
            icon="log-out"
            title="Sign Out"
            onPress={() => {}}
            danger
          />
        </View>
      </View>

      <View style={styles.section}>
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
      </View>

      <ThemedText type="caption" style={[styles.version, { color: theme.textTertiary }]}>
        RideX v1.0.0
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    marginBottom: Spacing.xl,
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
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
