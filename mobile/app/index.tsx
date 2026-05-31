// mobile/app/index.tsx
import { Text, View } from "react-native";

import { isSupabaseConfigured } from "@/config/env";
import { isFeatureEnabled } from "@/lib/feature-flags";

export default function IndexScreen() {
  const privateTestEnabled = isFeatureEnabled("mobile.private_test.enabled");

  return (
    <View className="flex-1 bg-background px-8 pb-10 pt-24">
      <View className="flex-1 items-center justify-center">
        <Text className="text-[44px] tracking-[12px] text-foreground">
          IRIS
        </Text>

        <Text className="mt-8 max-w-[260px] text-center text-body text-foreground">
          Um lugar para lembrar quem você é.
        </Text>

        <Text className="mt-4 max-w-[280px] text-center text-caption text-foreground-muted">
          Infraestrutura mobile inicial pronta. As próximas telas serão login e
          onboarding editorial.
        </Text>
      </View>

      <View className="rounded-3xl border border-border bg-surface px-5 py-4 shadow-irisSm">
        <Text className="text-caption font-semibold text-foreground">
          Estado do ambiente
        </Text>

        <Text className="mt-2 text-detail text-foreground-muted">
          Supabase: {isSupabaseConfigured ? "configurado" : "pendente de .env"}
        </Text>

        <Text className="mt-1 text-detail text-foreground-muted">
          Teste privado: {privateTestEnabled ? "liberado" : "bloqueado"}
        </Text>
      </View>
    </View>
  );
}
