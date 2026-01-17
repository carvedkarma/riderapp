import React from "react";

import RiderStackNavigator from "./RiderStackNavigator";
import DriverStackNavigator from "./DriverStackNavigator";
import AuthStackNavigator from "./AuthStackNavigator";
import { useAuthStore } from "@/stores/authStore";
import { isDriverApp } from "@/lib/appVariant";

export type RootStackParamList = {
  RiderApp: undefined;
  DriverApp: undefined;
};

export default function RootStackNavigator() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthStackNavigator />;
  }

  if (isDriverApp()) {
    return <DriverStackNavigator />;
  }

  return <RiderStackNavigator />;
}
