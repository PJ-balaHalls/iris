// mobile/app.config.ts
import "dotenv/config";
import type { ConfigContext, ExpoConfig } from "expo/config";

const readSupabaseUrl = () =>
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "";

const readSupabasePublishableKey = () =>
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export default ({ config }: ConfigContext): ExpoConfig => {
  const easProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return {
    ...config,
    name: "IRIS",
    slug: "iris-mobile",
    scheme: "iris",
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "social.iris.mobile"
    },
    android: {
      package: "social.iris.mobile",
      adaptiveIcon: {
        backgroundColor: "#FAF7F2"
      }
    },
    web: {
      bundler: "metro",
      output: "static"
    },
    experiments: {
      typedRoutes: true
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-font",
      "expo-notifications",
      [
        "expo-image-picker",
        {
          photosPermission:
            "O IRIS usa fotos para criar memórias, capas e identidade visual do seu espaço privado."
        }
      ]
    ],
    extra: {
      ...(config.extra ?? {}),
      iris: {
        appEnv:
          process.env.EXPO_PUBLIC_IRIS_ENV ??
          process.env.IRIS_ENV ??
          "development",
        supabaseUrl: readSupabaseUrl(),
        supabasePublishableKey: readSupabasePublishableKey(),
        enableFeatureFlagBootstrap: true
      },
      eas: easProjectId ? { projectId: easProjectId } : undefined
    }
  };
};
