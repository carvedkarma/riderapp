import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import DestinationSearchScreen from "@/screens/DestinationSearchScreen";
import RideConfirmationScreen from "@/screens/RideConfirmationScreen";
import ActiveRideScreen from "@/screens/ActiveRideScreen";
import RideCompleteScreen from "@/screens/RideCompleteScreen";
import RideDetailsScreen from "@/screens/RideDetailsScreen";
import SafetyCenterScreen from "@/screens/SafetyCenterScreen";
import PaymentMethodsScreen from "@/screens/PaymentMethodsScreen";
import SavedPlacesScreen from "@/screens/SavedPlacesScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

interface LocationPoint {
  address: string;
  latitude: number;
  longitude: number;
}

interface DriverInfo {
  name: string;
  rating: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
}

export type RootStackParamList = {
  Main: undefined;
  DestinationSearch: { savedLocationId?: string } | undefined;
  RideConfirmation: {
    pickup: LocationPoint;
    destination: LocationPoint;
  };
  ActiveRide: {
    rideId: string;
    pickup: LocationPoint;
    destination: LocationPoint;
    vehicleTier: string;
  };
  RideComplete: {
    rideId: string;
    fare: string;
    driver: DriverInfo;
  };
  RideDetails: {
    rideId: string;
  };
  SafetyCenter: undefined;
  PaymentMethods: undefined;
  SavedPlaces: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DestinationSearch"
        component={DestinationSearchScreen}
        options={{
          presentation: "modal",
          headerTitle: "Where to?",
        }}
      />
      <Stack.Screen
        name="RideConfirmation"
        component={RideConfirmationScreen}
        options={{
          headerTitle: "Confirm Ride",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="ActiveRide"
        component={ActiveRideScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="RideComplete"
        component={RideCompleteScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="RideDetails"
        component={RideDetailsScreen}
        options={{
          headerTitle: "Trip Details",
        }}
      />
      <Stack.Screen
        name="SafetyCenter"
        component={SafetyCenterScreen}
        options={{
          headerTitle: "Safety Center",
        }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{
          headerTitle: "Payment",
        }}
      />
      <Stack.Screen
        name="SavedPlaces"
        component={SavedPlacesScreen}
        options={{
          headerTitle: "Saved Places",
        }}
      />
    </Stack.Navigator>
  );
}
