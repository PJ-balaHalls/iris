import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { authCopy } from "@/constants/auth-copy";
import { getMyOfficialOnboardingStatus } from "@/services/official-onboarding.service";
import {
  getMyPrivateAccess,
  signOutPrivateSession
} from "@/services/private-login.service";
import { getPrivateKeepConnectedPreference } from "@/services/private-session-preferences.service";
import { usePrivateAccessStore } from "@/stores/private-access.store";

export default function SplashScreen() {
  const router = useRouter();

  const setActiveAccess = usePrivateAccessStore((state) => state.setActiveAccess);
  const setKeepConnected = usePrivateAccessStore((state) => state.setKeepConnected);
  const clearActiveAccess = usePrivateAccessStore((state) => state.clearActiveAccess);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      await new Promise((resolve) => setTimeout(resolve, 850));

      try {
        const keepConnected = await getPrivateKeepConnectedPreference();

        if (!mounted) return;

        setKeepConnected(keepConnected);

        if (!keepConnected) {
          await signOutPrivateSession();

          if (!mounted) return;

          clearActiveAccess();
          router.replace("/entry" as Href);
          return;
        }

        const access = await getMyPrivateAccess();
        const firstSession = access.sessions[0];

        if (!mounted) return;

        if (!firstSession) {
          clearActiveAccess();
          router.replace("/entry" as Href);
          return;
        }

        setActiveAccess(firstSession);

        const official = await getMyOfficialOnboardingStatus();

        if (!mounted) return;

        if (!official.completed) {
          router.replace("/official-onboarding" as Href);
          return;
        }

        router.replace("/home" as Href);
      } catch {
        if (!mounted) return;

        clearActiveAccess();
        router.replace("/entry" as Href);
      }
    }

    void boot();

    return () => {
      mounted = false;
    };
  }, [clearActiveAccess, router, setActiveAccess, setKeepConnected]);

  return (
    <View className="flex-1 bg-background px-8">
      <View className="flex-1 items-center justify-center">
        <Text className="text-[46px] tracking-[14px] text-foreground">
          {authCopy.brand}
        </Text>

        <Text className="mt-8 max-w-[250px] text-center text-body leading-7 text-foreground">
          {authCopy.splashSubtitle}
        </Text>
      </View>

      <View className="pb-10">
        <Text className="text-center text-detail text-foreground-muted">
          verificando acesso privado
        </Text>
      </View>
    </View>
  );
}
