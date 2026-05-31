import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { AuthResponsiveShell } from "@/components/auth/AuthResponsiveShell";
import { EntryAccessPanel } from "@/components/auth/EntryAccessPanel";
import { EntryHero } from "@/components/auth/EntryHero";
import { isSupabaseConfigured } from "@/config/env";
import { authCopy } from "@/constants/auth-copy";
import { fetchPrivateLoginEntryPoints } from "@/services/private-login.service";
import type { PrivateLoginEntry } from "@/types/private-login.types";

export default function EntryScreen() {
  const query = useQuery({
    queryKey: ["private-login-entry-points"],
    queryFn: fetchPrivateLoginEntryPoints,
    enabled: isSupabaseConfigured
  });

  const entries = useMemo<PrivateLoginEntry[]>(() => {
    if (query.data?.enabled && query.data.entries.length > 0) {
      return query.data.entries;
    }

    return [
      {
        slug: "isabela",
        label: authCopy.isabelaFallbackLabel,
        kind: "personalized_partner",
        relationship_label: "namorada"
      }
    ];
  }, [query.data]);

  return (
    <AuthResponsiveShell>
      {({ isTablet }) => (
        <View
          className={
            isTablet
              ? "min-h-[680px] flex-row items-center justify-between gap-14"
              : "gap-9"
          }
        >
          <View className={isTablet ? "flex-[1.08]" : undefined}>
            <EntryHero isTablet={isTablet} />
          </View>

          <View className={isTablet ? "flex-1" : undefined}>
            <EntryAccessPanel
              entries={entries}
              loading={query.isLoading}
              fetching={query.isFetching}
              onRefresh={() => void query.refetch()}
              isTablet={isTablet}
            />

            <Text className="mt-4 text-center text-detail text-foreground-muted">
              interface translúcida • sem dashboard • login afetivo
            </Text>
          </View>
        </View>
      )}
    </AuthResponsiveShell>
  );
}
