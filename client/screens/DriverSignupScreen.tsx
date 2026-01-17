import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn } from "react-native-reanimated";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

type DriverSignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, "Signup">;

interface Props {
  navigation: DriverSignupScreenNavigationProp;
}

const VEHICLE_TIERS = [
  { value: "economy", label: "Economy" },
  { value: "comfort", label: "Comfort" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
] as const;

export default function DriverSignupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login } = useAuthStore();
  
  const [step, setStep] = useState<1 | 2>(1);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleTier, setVehicleTier] = useState<"economy" | "comfort" | "premium" | "luxury">("economy");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handlePickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleNextStep = () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setError("");
    setStep(2);
  };

  const handleSignup = async () => {
    if (!vehicleMake.trim() || !vehicleModel.trim() || !vehicleColor.trim() || !vehiclePlate.trim()) {
      setError("Please fill in all vehicle details");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(new URL("/api/auth/driver-signup", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          avatarUrl: avatarUri,
          vehicleMake: vehicleMake.trim(),
          vehicleModel: vehicleModel.trim(),
          vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : null,
          vehicleColor: vehicleColor.trim(),
          vehiclePlate: vehiclePlate.trim().toUpperCase(),
          vehicleTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      login(data.user, data.driverProfile);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.accent }]}>
            <Feather name="truck" size={32} color={theme.backgroundRoot} />
          </View>
          <ThemedText type="h2" style={styles.title}>
            {step === 1 ? "Driver Registration" : "Vehicle Details"}
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 1 ? "Create your driver account" : "Tell us about your vehicle"}
          </ThemedText>
          
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: theme.accent }]} />
            <View style={[styles.stepLine, { backgroundColor: step === 2 ? theme.accent : theme.backgroundSecondary }]} />
            <View style={[styles.stepDot, { backgroundColor: step === 2 ? theme.accent : theme.backgroundSecondary }]} />
          </View>
        </Animated.View>

        {step === 1 ? (
          <Animated.View key="step1" entering={FadeIn.duration(400)}>
            <GlassCard style={styles.formCard}>
              {error ? (
                <View style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}>
                  <Feather name="alert-circle" size={16} color={theme.error} />
                  <ThemedText type="caption" style={{ color: theme.error, flex: 1 }}>
                    {error}
                  </ThemedText>
                </View>
              ) : null}

              <Pressable onPress={handlePickImage} style={styles.avatarSection}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather name="camera" size={24} color={theme.textTertiary} />
                  </View>
                )}
                <ThemedText type="caption" style={{ color: theme.accent }}>
                  Add Profile Photo
                </ThemedText>
              </Pressable>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                  FULL NAME *
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="user" size={20} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.textTertiary}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                  EMAIL *
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="mail" size={20} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                  PHONE (OPTIONAL)
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="phone" size={20} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your phone number"
                    placeholderTextColor={theme.textTertiary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                  PASSWORD *
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="lock" size={20} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Create a password (min 6 chars)"
                    placeholderTextColor={theme.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Feather 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={theme.textTertiary} 
                    />
                  </Pressable>
                </View>
              </View>

              <Button
                onPress={handleNextStep}
                style={styles.button}
                fullWidth
              >
                Continue
              </Button>
            </GlassCard>
          </Animated.View>
        ) : (
          <Animated.View key="step2" entering={FadeIn.duration(400)}>
            <GlassCard style={styles.formCard}>
              {error ? (
                <View style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}>
                  <Feather name="alert-circle" size={16} color={theme.error} />
                  <ThemedText type="caption" style={{ color: theme.error, flex: 1 }}>
                    {error}
                  </ThemedText>
                </View>
              ) : null}

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                    MAKE *
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="Toyota"
                      placeholderTextColor={theme.textTertiary}
                      value={vehicleMake}
                      onChangeText={setVehicleMake}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                    MODEL *
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="Camry"
                      placeholderTextColor={theme.textTertiary}
                      value={vehicleModel}
                      onChangeText={setVehicleModel}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                    YEAR
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="2022"
                      placeholderTextColor={theme.textTertiary}
                      value={vehicleYear}
                      onChangeText={setVehicleYear}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                    COLOR *
                  </ThemedText>
                  <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="Silver"
                      placeholderTextColor={theme.textTertiary}
                      value={vehicleColor}
                      onChangeText={setVehicleColor}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                  LICENSE PLATE *
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="credit-card" size={20} color={theme.textTertiary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="ABC 1234"
                    placeholderTextColor={theme.textTertiary}
                    value={vehiclePlate}
                    onChangeText={setVehiclePlate}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="caption" style={[styles.label, { color: theme.textSecondary }]}>
                  VEHICLE TIER
                </ThemedText>
                <View style={styles.tierGrid}>
                  {VEHICLE_TIERS.map((tier) => (
                    <Pressable
                      key={tier.value}
                      onPress={() => {
                        setVehicleTier(tier.value);
                        if (Platform.OS !== "web") {
                          Haptics.selectionAsync();
                        }
                      }}
                      style={[
                        styles.tierOption,
                        {
                          backgroundColor: vehicleTier === tier.value ? theme.accent : theme.backgroundSecondary,
                        },
                      ]}
                    >
                      <ThemedText
                        type="caption"
                        style={{ 
                          color: vehicleTier === tier.value ? theme.backgroundRoot : theme.text,
                          fontWeight: vehicleTier === tier.value ? "600" : "400",
                        }}
                      >
                        {tier.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={() => {
                    setStep(1);
                    setError("");
                  }}
                  style={[styles.backButton, { borderColor: theme.textTertiary }]}
                >
                  <Feather name="arrow-left" size={20} color={theme.text} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Button
                    onPress={handleSignup}
                    disabled={isLoading}
                    loading={isLoading}
                    fullWidth
                  >
                    {isLoading ? "Creating Account..." : "Start Driving"}
                  </Button>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.footer}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Already have an account?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.goBack()}>
            <ThemedText type="body" style={{ color: theme.accent, fontWeight: "600" }}>
              Sign In
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    width: 40,
    height: 2,
  },
  formCard: {
    padding: Spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  tierGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tierOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
});
