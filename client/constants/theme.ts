import { Platform } from "react-native";

const tintColorLight = "#C9AA70";
const tintColorDark = "#D4B87A";

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#6E6E73",
    textTertiary: "#AEAEB2",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6E6E73",
    tabIconSelected: tintColorLight,
    link: "#C9AA70",
    accent: "#C9AA70",
    accentLight: "rgba(201, 170, 112, 0.15)",
    success: "#34C759",
    error: "#FF3B30",
    warning: "#FF9500",
    mapAccent: "#007AFF",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F8F8F8",
    backgroundSecondary: "#F2F2F2",
    backgroundTertiary: "#E6E6E6",
    glass: "rgba(255, 255, 255, 0.8)",
    glassBorder: "rgba(255, 255, 255, 0.3)",
    cardShadow: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#AEAEB2",
    textTertiary: "#6E6E73",
    buttonText: "#000000",
    tabIconDefault: "#6E6E73",
    tabIconSelected: tintColorDark,
    link: "#D4B87A",
    accent: "#D4B87A",
    accentLight: "rgba(212, 184, 122, 0.15)",
    success: "#30D158",
    error: "#FF453A",
    warning: "#FF9F0A",
    mapAccent: "#0A84FF",
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3A3A3C",
    glass: "rgba(28, 28, 30, 0.8)",
    glassBorder: "rgba(255, 255, 255, 0.1)",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
  inputHeight: 52,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  full: 9999,
};

export const Typography = {
  hero: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700" as const,
    letterSpacing: 0.4,
  },
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
    letterSpacing: 0.35,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600" as const,
    letterSpacing: 0.35,
  },
  h3: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.4,
  },
  h4: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "400" as const,
    letterSpacing: -0.4,
  },
  small: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400" as const,
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
    letterSpacing: -0.1,
  },
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.4,
  },
  link: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "400" as const,
    letterSpacing: -0.4,
  },
};

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
