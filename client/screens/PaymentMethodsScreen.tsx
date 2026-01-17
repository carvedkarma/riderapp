import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const MOCK_CARDS = [
  {
    id: "1",
    brand: "visa",
    last4: "4242",
    isDefault: true,
  },
  {
    id: "2",
    brand: "mastercard",
    last4: "8888",
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleCardPress = (cardId: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  };

  const handleAddCard = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const getCardIcon = (brand: string) => {
    return "credit-card";
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
          Payment Methods
        </ThemedText>

        {MOCK_CARDS.map((card) => (
          <GlassCard
            key={card.id}
            style={styles.cardItem}
            onPress={() => handleCardPress(card.id)}
          >
            <View style={[styles.cardIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name={getCardIcon(card.brand)} size={24} color={theme.text} />
            </View>
            <View style={styles.cardInfo}>
              <ThemedText type="body">
                {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} ending in {card.last4}
              </ThemedText>
              {card.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: theme.accentLight }]}>
                  <ThemedText type="caption" style={{ color: theme.accent }}>
                    Default
                  </ThemedText>
                </View>
              ) : null}
            </View>
            <Feather name="chevron-right" size={20} color={theme.textTertiary} />
          </GlassCard>
        ))}

        <Pressable
          style={[styles.addButton, { borderColor: theme.textTertiary }]}
          onPress={handleAddCard}
        >
          <Feather name="plus" size={24} color={theme.accent} />
          <ThemedText type="body" style={{ color: theme.accent }}>
            Add Payment Method
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Other Payment Options
        </ThemedText>

        <GlassCard style={styles.cardItem} onPress={() => {}}>
          <View style={[styles.cardIcon, { backgroundColor: "#000000" }]}>
            <Feather name="smartphone" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardInfo}>
            <ThemedText type="body">Apple Pay</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Use your Apple Wallet
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </GlassCard>

        <GlassCard style={styles.cardItem} onPress={() => {}}>
          <View style={[styles.cardIcon, { backgroundColor: theme.mapAccent }]}>
            <Feather name="dollar-sign" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.cardInfo}>
            <ThemedText type="body">Cash</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Pay driver directly
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textTertiary} />
        </GlassCard>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="lock" size={20} color={theme.textSecondary} />
        <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }}>
          Your payment information is encrypted and securely stored. We never store your full card number.
        </ThemedText>
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
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  defaultBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});
