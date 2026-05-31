// mobile/src/config/env.ts
import Constants from "expo-constants";
import { z } from "zod";

type IrisExpoExtra = {
  iris?: {
    appEnv?: unknown;
    supabaseUrl?: unknown;
    supabasePublishableKey?: unknown;
    enableFeatureFlagBootstrap?: unknown;
  };
};

const extra = Constants.expoConfig?.extra as IrisExpoExtra | undefined;

const publicEnvSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "production"]),
  SUPABASE_URL: z.string(),
  SUPABASE_PUBLISHABLE_KEY: z.string(),
  ENABLE_FEATURE_FLAG_BOOTSTRAP: z.boolean()
});

const parsed = publicEnvSchema.safeParse({
  APP_ENV: extra?.iris?.appEnv ?? "development",
  SUPABASE_URL: extra?.iris?.supabaseUrl ?? "",
  SUPABASE_PUBLISHABLE_KEY: extra?.iris?.supabasePublishableKey ?? "",
  ENABLE_FEATURE_FLAG_BOOTSTRAP:
    extra?.iris?.enableFeatureFlagBootstrap ?? true
});

if (!parsed.success) {
  console.error("[IRIS_MOBILE_ENV_INVALID]", parsed.error.flatten().fieldErrors);
}

export const env = parsed.success
  ? parsed.data
  : {
      APP_ENV: "development",
      SUPABASE_URL: "",
      SUPABASE_PUBLISHABLE_KEY: "",
      ENABLE_FEATURE_FLAG_BOOTSTRAP: true
    };

export const isSupabaseConfigured =
  env.SUPABASE_URL.length > 0 && env.SUPABASE_PUBLISHABLE_KEY.length > 0;
