import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DriverOnboardingScreen from "@/screens/driver/DriverOnboardingScreen";
import DriverHomeScreen from "@/screens/driver/DriverHomeScreen";
import DriverActiveTripScreen from "@/screens/driver/DriverActiveTripScreen";
import DriverTripCompleteScreen from "@/screens/driver/DriverTripCompleteScreen";
import DriverEarningsScreen from "@/screens/driver/DriverEarningsScreen";
import DriverProfileScreen from "@/screens/driver/DriverProfileScreen";

import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";

export type DriverStackParamList = {
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

const Stack = createNativeStackNavigator<DriverStackParamList>();

export default function DriverStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();
  const { driverProfile } = useAuthStore();

  // If driver already has a profile, skip onboarding
  const initialRoute = driverProfile ? "DriverHome" : "DriverOnboarding";

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        ...screenOptions,
        headerStyle: {
          backgroundColor: theme.backgroundRoot,
        },
        headerTintColor: theme.text,
      }}
    >
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
