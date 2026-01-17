import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RoleSelectorScreen from "@/screens/RoleSelectorScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import DestinationSearchScreen from "@/screens/DestinationSearchScreen";
import RideConfirmationScreen from "@/screens/RideConfirmationScreen";
import ActiveRideScreen from "@/screens/ActiveRideScreen";
import RideCompleteScreen from "@/screens/RideCompleteScreen";
import RideDetailsScreen from "@/screens/RideDetailsScreen";
import SafetyCenterScreen from "@/screens/SafetyCenterScreen";
import PaymentMethodsScreen from "@/screens/PaymentMethodsScreen";
import SavedPlacesScreen from "@/screens/SavedPlacesScreen";
import ActivityScreen from "@/screens/ActivityScreen";
import AccountScreen from "@/screens/AccountScreen";

import DriverOnboardingScreen from "@/screens/driver/DriverOnboardingScreen";
import DriverHomeScreen from "@/screens/driver/DriverHomeScreen";
import DriverActiveTripScreen from "@/screens/driver/DriverActiveTripScreen";
import DriverTripCompleteScreen from "@/screens/driver/DriverTripCompleteScreen";
import DriverEarningsScreen from "@/screens/driver/DriverEarningsScreen";
import DriverProfileScreen from "@/screens/driver/DriverProfileScreen";

import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";

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
  RoleSelector: undefined;
  Dashboard: undefined;
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
  Activity: undefined;
  Account: undefined;
  DriverOnboarding: undefined;
  DriverHome: undefined;
  DriverActiveTrip: {
    tripId: string;
  };
  DriverTripComplete: {
    tripId: string;
    earnings: string;
  };
  DriverEarnings: undefined;
  DriverProfile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="RoleSelector"
      screenOptions={{
        ...screenOptions,
        headerStyle: {
          backgroundColor: theme.backgroundRoot,
        },
        headerTintColor: theme.text,
      }}
    >
      <Stack.Screen
        name="RoleSelector"
        component={RoleSelectorScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DestinationSearch"
        component={DestinationSearchScreen}
        options={{
          presentation: "modal",
          headerTitle: "Set destination",
          headerStyle: {
            backgroundColor: theme.backgroundRoot,
          },
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
      <Stack.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          headerTitle: "Activity",
        }}
      />
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{
          headerTitle: "Account",
        }}
      />

      <Stack.Screen
        name="DriverOnboarding"
        component={DriverOnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DriverActiveTrip"
        component={DriverActiveTripScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="DriverTripComplete"
        component={DriverTripCompleteScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="DriverEarnings"
        component={DriverEarningsScreen}
        options={{
          headerTitle: "Earnings",
        }}
      />
      <Stack.Screen
        name="DriverProfile"
        component={DriverProfileScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
    </Stack.Navigator>
  );
}
