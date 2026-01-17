import React, { useState } from "react";
import { StyleSheet, View, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import Animated, { FadeIn, FadeInRight, SlideInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type DriverOnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverOnboarding"
>;

interface Props {
  navigation: DriverOnboardingScreenNavigationProp;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  action?: () => Promise<boolean>;
  actionLabel?: string;
}

export default function DriverOnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome, Driver!",
      description: "Let's get you set up to start earning with RideX. This will only take a minute.",
      icon: "truck",
    },
    {
      id: "location",
      title: "Enable Location",
      description: "We need your location to match you with nearby riders and provide navigation.",
      icon: "map-pin",
      action: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === "granted";
      },
      actionLabel: "Enable Location",
    },
    {
      id: "profile",
      title: "Your Profile",
      description: "Your profile helps riders know who's picking them up. You can update this later.",
      icon: "user",
    },
    {
      id: "vehicle",
      title: "Your Vehicle",
      description: "Add your vehicle details. This helps riders identify your car when you arrive.",
      icon: "truck",
    },
    {
      id: "ready",
      title: "You're All Set!",
      description: "Start accepting rides and earning money on your own schedule.",
      icon: "check-circle",
    },
  ];

  const handleAction = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const step = steps[currentStep];
    
    if (step.action) {
      setIsLoading(true);
      const success = await step.action();
      setIsLoading(false);
      
      if (success) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
      }
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace("DriverHome");
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index === currentStep
                      ? theme.accent
                      : index < currentStep
                      ? theme.accent + "80"
                      : theme.backgroundTertiary,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <Animated.View 
        key={currentStep}
        entering={SlideInRight.springify().damping(20)}
        style={styles.content}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}>
          <Feather name={step.icon} size={48} color={theme.accent} />
        </View>

        <ThemedText type="h1" style={styles.title}>
          {step.title}
        </ThemedText>

        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
          {step.description}
        </ThemedText>

        {step.id === "profile" ? (
          <View style={styles.mockProfile}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="user" size={40} color={theme.textTertiary} />
            </View>
            <View style={[styles.mockInput, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="body" style={{ color: theme.textTertiary }}>John Driver</ThemedText>
            </View>
            <View style={[styles.mockInput, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText type="body" style={{ color: theme.textTertiary }}>+1 (555) 123-4567</ThemedText>
            </View>
          </View>
        ) : null}

        {step.id === "vehicle" ? (
          <View style={styles.mockVehicle}>
            <View style={[styles.vehicleCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.vehicleIcon, { backgroundColor: theme.accent + "20" }]}>
                <Feather name="truck" size={24} color={theme.accent} />
              </View>
              <View style={styles.vehicleInfo}>
                <ThemedText type="h4">Toyota Camry</ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  2022 • Silver • ABC 1234
                </ThemedText>
              </View>
              <Feather name="check-circle" size={20} color={theme.success} />
            </View>
          </View>
        ) : null}
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Button onPress={handleAction} fullWidth loading={isLoading}>
          {isLastStep ? "Start Driving" : step.actionLabel || "Continue"}
        </Button>

        {!isLastStep && currentStep > 0 ? (
          <Button variant="ghost" onPress={handleSkip}>
            Skip for now
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["4xl"],
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 24,
  },
  mockProfile: {
    width: "100%",
    marginTop: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  mockInput: {
    width: "100%",
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  mockVehicle: {
    width: "100%",
    marginTop: Spacing["2xl"],
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfo: {
    flex: 1,
    gap: 4,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
});
