import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "@/screens/LoginScreen";
import SignupScreen from "@/screens/SignupScreen";
import DriverSignupScreen from "@/screens/DriverSignupScreen";
import { useTheme } from "@/hooks/useTheme";
import { isDriverApp } from "@/lib/appVariant";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.backgroundRoot },
        animation: "fade",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen 
        name="Signup" 
        component={isDriverApp() ? DriverSignupScreen : SignupScreen} 
      />
    </Stack.Navigator>
  );
}
