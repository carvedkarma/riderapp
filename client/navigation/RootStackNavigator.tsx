import React from "react";

import RiderStackNavigator from "./RiderStackNavigator";
import DriverStackNavigator from "./DriverStackNavigator";
import AuthStackNavigator from "./AuthStackNavigator";
import RoleSelectorScreen from "@/screens/RoleSelectorScreen";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";

export type RootStackParamList = {
  RoleSelector: undefined;
  RiderApp: undefined;
  DriverApp: undefined;
};

export default function RootStackNavigator() {
  const { mode, debugMode } = useAppStore();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthStackNavigator />;
  }

  if (debugMode) {
    return <RoleSelectorScreen />;
  }

  if (mode === "driver") {
    return <DriverStackNavigator />;
  }

  return <RiderStackNavigator />;
}
