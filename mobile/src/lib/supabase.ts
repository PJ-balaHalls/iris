// mobile/src/lib/supabase.ts
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createClient,
  processLock,
  type SupabaseClient
} from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { env, isSupabaseConfigured } from "@/config/env";

function createIrisSupabaseClient(): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock
    }
  });
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createIrisSupabaseClient()
  : null;

export function registerSupabaseAppStateListener(): () => void {
  if (Platform.OS === "web" || !supabase) {
    return () => undefined;
  }

  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      void supabase.auth.startAutoRefresh();
      return;
    }

    void supabase.auth.stopAutoRefresh();
  });

  return () => subscription.remove();
}
