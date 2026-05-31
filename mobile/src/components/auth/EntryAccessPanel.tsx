import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Fingerprint,
  LockKeyhole,
  RefreshCcw
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { AuthFadeInView } from "@/components/auth/AuthFadeInView";
import { AuthTranslucentPanel } from "@/components/auth/AuthTranslucentPanel";
import { IrisButton } from "@/components/ui/IrisButton";
import { isSupabaseConfigured } from "@/config/env";
import { authCopy } from "@/constants/auth-copy";
import type { PrivateLoginEntry } from "@/types/private-login.types";

type EntryAccessPanelProps = {
  entries: PrivateLoginEntry[];
  loading: boolean;
  fetching: boolean;
  onRefresh: () => void;
  isTablet: boolean;
};

function LoadingAccessOptions() {
  return (
    <View className="gap-4">
      <View className="h-[92px] rounded-[28px] border border-border/80 bg-[#FAF7F2]/45" />
      <View className="h-[142px] rounded-[30px] bg-foreground/15" />
    </View>
  );
}

export function EntryAccessPanel({
  entries,
  loading,
  fetching,
  onRefresh,
  isTablet
}: EntryAccessPanelProps) {
  const router = useRouter();

  return (
    <AuthFadeInView delay={isTablet ? 190 : 300} distance={18}>
      <AuthTranslucentPanel intense className="w-full">
        <View className="flex-row items-start justify-between gap-5">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/70">
            <LockKeyhole size={19} color="#111111" />
          </View>

          <View className="rounded-full bg-background/60 px-3 py-1.5">
            <Text className="text-detail font-semibold text-foreground-muted">
              login
            </Text>
          </View>
        </View>

        <Text
          className={
            isTablet
              ? "mt-8 text-[35px] leading-[40px] tracking-[-1.2px] text-foreground"
              : "mt-8 text-[29px] leading-[34px] tracking-[-1px] text-foreground"
          }
        >
          Como você quer entrar?
        </Text>

        <Text className="mt-3 text-caption leading-6 text-foreground-muted">
          Escolha uma entrada. O cadastro global ainda está fechado; este teste
          abre apenas o caminho privado.
        </Text>

        <View className="mt-7 gap-4">
          {!isSupabaseConfigured ? (
            <View className="rounded-[24px] border border-border/80 bg-background/55 px-4 py-4">
              <Text className="text-caption font-semibold text-foreground">
                Ambiente pendente
              </Text>
              <Text className="mt-2 text-caption leading-5 text-foreground-muted">
                {authCopy.supabaseMissing}
              </Text>
            </View>
          ) : loading ? (
            <LoadingAccessOptions />
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                disabled
                className="rounded-[28px] border border-border/80 bg-transparent px-5 py-5 opacity-55"
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-11 w-11 items-center justify-center rounded-full border border-border bg-background/60">
                    <Text className="text-[19px] text-foreground">＋</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-[17px] font-semibold text-foreground">
                      {authCopy.newUserTitle}
                    </Text>

                    <Text className="mt-1 text-caption leading-5 text-foreground-muted">
                      {authCopy.newUserDescription}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {entries.map((entry) => (
                <Pressable
                  key={entry.slug}
                  accessibilityRole="button"
                  onPress={() =>
                    router.push(("/private-login/" + entry.slug) as Href)
                  }
                  className="overflow-hidden rounded-[30px] bg-foreground active:opacity-90"
                >
                  <View className="px-5 py-5">
                    <View className="flex-row items-center justify-between">
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <Fingerprint size={22} color="#FFFFFF" />
                      </View>

                      <View className="rounded-full border border-white/15 px-3 py-1.5">
                        <Text className="text-detail font-semibold text-white/70">
                          quiz privado
                        </Text>
                      </View>
                    </View>

                    <Text className="mt-8 text-[29px] leading-[34px] tracking-[-1px] text-white">
                      {entry.label}
                    </Text>

                    <View className="mt-5 flex-row items-end justify-between gap-5">
                      <Text className="flex-1 text-caption leading-6 text-white/70">
                        Entre respondendo três lembranças. Sem formulário comum.
                      </Text>

                      <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
                        <ArrowRight size={19} color="#111111" />
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </>
          )}
        </View>

        <View className="mt-7 border-t border-border/70 pt-5">
          <IrisButton
            label="Atualizar entradas"
            variant="ghost"
            onPress={onRefresh}
            disabled={!isSupabaseConfigured || fetching}
            loading={fetching}
          />

          <View className="mt-3 flex-row items-center justify-center gap-2">
            <RefreshCcw size={13} color="#666666" />
            <Text className="text-detail text-foreground-muted">
              {fetching ? "sincronizando" : "as entradas vêm do banco"}
            </Text>
          </View>
        </View>
      </AuthTranslucentPanel>

      <Text className="mt-5 text-center text-detail text-foreground-muted">
        {authCopy.signature}
      </Text>
    </AuthFadeInView>
  );
}
