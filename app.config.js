export default ({ config }) => ({
  ...config,
  name: "mobile-app",
  slug: "mobile-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "com.nucyloodle.mobileapp",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    ...config.android,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.nucyloodle.mobileapp",
    intentFilters: [
      {
        action: "VIEW",
        data: [
          {
            scheme: "myapp",
            host: "invite"
          }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ],
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash_icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#b8ecce"
      }
    ],
    "expo-font",
    "expo-secure-store"
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: false
    },
    eas: {
      projectId: "784d4ace-49db-4be1-a152-c3dba2d7bc06"
    }
  }
});
