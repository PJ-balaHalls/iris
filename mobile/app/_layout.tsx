// mobile/app/_layout.tsx
import "react-native-gesture-handler";
import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "@/lib/query-client";
import { registerSupabaseAppStateListener } from "@/lib/supabase";

export default function RootLayout() {
  useEffect(() => registerSupabaseAppStateListener(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "fade",
            contentStyle: {
              backgroundColor: "#FAF7F2"
            }
          }}
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
