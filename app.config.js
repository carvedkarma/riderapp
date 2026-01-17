const IS_DRIVER_APP = process.env.APP_VARIANT === 'driver';

const riderConfig = {
  name: "RideX",
  slug: "ridex",
  icon: "./assets/images/icon.png",
  scheme: "ridex",
  bundleIdentifier: "com.ridex.rider",
  package: "com.ridex.rider",
  splashImage: "./assets/images/splash-icon.png",
  locationPermission: "RideX needs your location to find nearby drivers and provide accurate pickup locations.",
};

const driverConfig = {
  name: "RideX Driver",
  slug: "ridex-driver",
  icon: "./assets/images/driver-icon.png",
  scheme: "ridexdriver",
  bundleIdentifier: "com.ridex.driver",
  package: "com.ridex.driver",
  splashImage: "./assets/images/driver-splash-icon.png",
  locationPermission: "RideX Driver needs your location to receive nearby ride requests and navigate to pickups.",
};

const config = IS_DRIVER_APP ? driverConfig : riderConfig;

export default {
  expo: {
    name: config.name,
    slug: config.slug,
    version: "1.0.0",
    orientation: "portrait",
    icon: config.icon,
    scheme: config.scheme,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      appVariant: IS_DRIVER_APP ? 'driver' : 'rider',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: config.bundleIdentifier,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: config.locationPermission,
        NSLocationAlwaysAndWhenInUseUsageDescription: config.locationPermission,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#000000",
        foregroundImage: config.icon,
      },
      package: config.package,
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
      ],
    },
    web: {
      output: "single",
      favicon: config.icon,
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: config.splashImage,
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-web-browser",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: config.locationPermission,
        },
      ],
    ],
    experiments: {
      reactCompiler: true,
    },
  },
};
