import React from "react";
import { View } from "react-native";

import RiderStackNavigator from "./RiderStackNavigator";
import DriverStackNavigator from "./DriverStackNavigator";
import RoleSelectorScreen from "@/screens/RoleSelectorScreen";
import { useAppStore } from "@/stores/appStore";

export type RootStackParamList = {
  RoleSelector: undefined;
  RiderApp: undefined;
  DriverApp: undefined;
};

export default function RootStackNavigator() {
  const { mode, debugMode } = useAppStore();

  if (debugMode) {
    return <RoleSelectorScreen />;
  }

  if (mode === "driver") {
    return <DriverStackNavigator />;
  }

  return <RiderStackNavigator />;
}
