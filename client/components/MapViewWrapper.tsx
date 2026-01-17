import React, { forwardRef } from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

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

const MapViewWrapper = forwardRef<MapView, MapViewWrapperProps>(
  (
    {
      children,
      style,
      initialRegion,
      showsUserLocation,
      showsMyLocationButton,
      showsCompass,
      userInterfaceStyle,
    },
    ref
  ) => {
    return (
      <MapView
        ref={ref}
        style={style}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={showsMyLocationButton}
        showsCompass={showsCompass}
        userInterfaceStyle={userInterfaceStyle}
      >
        {children}
      </MapView>
    );
  }
);

MapViewWrapper.displayName = "MapViewWrapper";

export { MapViewWrapper, Marker, Polyline, PROVIDER_GOOGLE };
