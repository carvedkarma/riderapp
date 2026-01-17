import React, { forwardRef } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface MapViewWrapperProps {
  children?: React.ReactNode;
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  showsCompass?: boolean;
  userInterfaceStyle?: "dark" | "light";
}

const MapViewWrapper = forwardRef<any, MapViewWrapperProps>(
  ({ style }, ref) => {
    const { theme } = useTheme();

    return (
      <View
        style={[
          styles.webPlaceholder,
          { backgroundColor: theme.backgroundSecondary },
          style,
        ]}
      >
        <ThemedText type="h3" style={{ color: theme.textSecondary }}>
          Map View
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textTertiary, textAlign: "center" }}>
          Maps are available in the Expo Go app.{"\n"}Scan the QR code to view on your device.
        </ThemedText>
      </View>
    );
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

const Marker = null;
const Polyline = null;
const PROVIDER_GOOGLE = null;

export { MapViewWrapper, Marker, Polyline, PROVIDER_GOOGLE };

const styles = StyleSheet.create({
  webPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.xl,
  },
});
