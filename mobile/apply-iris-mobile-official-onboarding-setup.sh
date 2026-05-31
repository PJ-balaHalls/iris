#!/usr/bin/env bash
set -euo pipefail

mkdir -p "mobile/src/components/auth"
mkdir -p "mobile/src/components/onboarding"
mkdir -p "mobile/src/components/ui"
mkdir -p "mobile/src/schemas"
mkdir -p "mobile/src/services"
mkdir -p "mobile/src/stores"
mkdir -p "mobile/src/types"
mkdir -p "mobile/src/utils"
mkdir -p "mobile/app/(auth)"
mkdir -p "mobile/app/(tabs)"

cat > "mobile/src/components/auth/AuthFadeInView.tsx" <<'EOF'
// mobile/src/components/auth/AuthFadeInView.tsx
import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle
} from "react-native";

type AuthFadeInViewProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

export function AuthFadeInView({
  children,
  delay = 0,
  distance = 14,
  style
}: AuthFadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 440,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 440,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  }, [delay, distance, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}
EOF

cat > "mobile/src/components/auth/AuthTranslucentPanel.tsx" <<'EOF'
// mobile/src/components/auth/AuthTranslucentPanel.tsx
import { View, type ViewProps } from "react-native";

import { cn } from "@/utils/cn";

type AuthTranslucentPanelProps = ViewProps & {
  intense?: boolean;
};

export function AuthTranslucentPanel({
  children,
  className,
  intense = false,
  ...props
}: AuthTranslucentPanelProps) {
  return (
    <View
      className={cn(
        "rounded-[34px] border px-5 py-5",
        intense
          ? "border-foreground/15 bg-[#F5F0E8]/90"
          : "border-border/80 bg-[#FAF7F2]/55",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
EOF

cat > "mobile/src/components/auth/AuthResponsiveShell.tsx" <<'EOF'
// mobile/src/components/auth/AuthResponsiveShell.tsx
import { ScrollView, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type AuthResponsiveShellProps = {
  children: (layout: {
    width: number;
    height: number;
    isTablet: boolean;
    isLargeTablet: boolean;
    isShortScreen: boolean;
    pageMaxWidth: number;
  }) => ReactNode;
};

export function AuthResponsiveShell({ children }: AuthResponsiveShellProps) {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargeTablet = width >= 1040;
  const isShortScreen = height < 720;

  const pageMaxWidth = isLargeTablet ? 1180 : isTablet ? 960 : 540;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: isTablet ? 48 : width < 380 ? 20 : 26,
          paddingTop: isTablet ? 34 : isShortScreen ? 18 : 28,
          paddingBottom: isTablet ? 38 : 28,
          alignItems: "center"
        }}
      >
        <View
          className={cn("w-full flex-1 justify-center")}
          style={{ maxWidth: pageMaxWidth }}
        >
          {children({
            width,
            height,
            isTablet,
            isLargeTablet,
            isShortScreen,
            pageMaxWidth
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
EOF

cat > "mobile/src/components/auth/EntryHero.tsx" <<'EOF'
// mobile/src/components/auth/EntryHero.tsx
import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { AuthFadeInView } from "@/components/auth/AuthFadeInView";
import { cn } from "@/utils/cn";

type EntryHeroProps = {
  isTablet: boolean;
};

export function EntryHero({ isTablet }: EntryHeroProps) {
  return (
    <View className={cn("relative", isTablet ? "justify-center" : "")}>
      <View className="absolute -left-8 top-2 h-44 w-44 rounded-full bg-[#EEE8DF]/70" />
      <View className="absolute right-0 top-28 h-24 w-24 rounded-full bg-[#E6DED2]/70" />
      <View className="absolute -bottom-8 right-8 h-56 w-56 rounded-full bg-[#F4EFE8]/90" />

      <AuthFadeInView delay={0}>
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
            <Sparkles size={17} color="#FFFFFF" />
          </View>

          <View>
            <Text className="text-detail font-semibold uppercase tracking-[2px] text-foreground-muted">
              IRIS private
            </Text>
            <Text className="mt-0.5 text-caption text-foreground-muted">
              entrada afetiva
            </Text>
          </View>
        </View>
      </AuthFadeInView>

      <AuthFadeInView delay={90} distance={18}>
        <Text
          className={cn(
            "mt-12 text-foreground",
            isTablet
              ? "max-w-[490px] text-[58px] leading-[63px] tracking-[-2.6px]"
              : "text-[43px] leading-[48px] tracking-[-2px]"
          )}
        >
          Uma porta feita para uma pessoa só.
        </Text>
      </AuthFadeInView>

      <AuthFadeInView delay={170} distance={16}>
        <Text
          className={cn(
            "mt-6 max-w-[410px] text-foreground-muted",
            isTablet ? "text-[18px] leading-8" : "text-body leading-7"
          )}
        >
          A IRIS começa perguntando se a memória reconhece quem está tentando
          entrar.
        </Text>
      </AuthFadeInView>

      <AuthFadeInView delay={250} distance={14}>
        <View className="mt-10 flex-row gap-3">
          <View className="flex-1 rounded-[28px] border border-border/80 bg-[#FAF7F2]/50 px-4 py-4">
            <Text className="text-detail uppercase tracking-[1.4px] text-foreground-muted">
              acesso
            </Text>
            <Text className="mt-3 text-[19px] leading-6 text-foreground">
              por memória
            </Text>
          </View>

          <View className="mt-8 flex-1 rounded-[28px] bg-[#EEE8DF]/70 px-4 py-4">
            <Text className="text-detail uppercase tracking-[1.4px] text-foreground-muted">
              espaço
            </Text>
            <Text className="mt-3 text-[19px] leading-6 text-foreground">
              só nosso
            </Text>
          </View>
        </View>
      </AuthFadeInView>
    </View>
  );
}
EOF

cat > "mobile/src/components/auth/EntryAccessPanel.tsx" <<'EOF'
// mobile/src/components/auth/EntryAccessPanel.tsx
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
                    router.push(`/private-login/${entry.slug}` as Href)
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
EOF

cat > "mobile/src/components/ui/IrisTextInput.tsx" <<'EOF'
// mobile/src/components/ui/IrisTextInput.tsx
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/utils/cn";

type IrisTextInputProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function IrisTextInput({
  label,
  error,
  className,
  ...props
}: IrisTextInputProps) {
  return (
    <View>
      <Text className="mb-2 text-detail font-semibold uppercase tracking-[1.4px] text-foreground-muted">
        {label}
      </Text>

      <TextInput
        placeholderTextColor="#8A8177"
        className={cn(
          "min-h-[54px] rounded-2xl border border-border/80 bg-[#FAF7F2]/60 px-4 text-[16px] text-foreground",
          error && "border-danger",
          className
        )}
        {...props}
      />

      {error ? (
        <Text className="mt-2 text-detail leading-4 text-danger">{error}</Text>
      ) : null}
    </View>
  );
}
EOF

cat > "mobile/src/components/onboarding/OnboardingStepHeader.tsx" <<'EOF'
// mobile/src/components/onboarding/OnboardingStepHeader.tsx
import { Text, View } from "react-native";

type OnboardingStepHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function OnboardingStepHeader({
  eyebrow,
  title,
  description
}: OnboardingStepHeaderProps) {
  return (
    <View>
      <Text className="text-detail font-semibold uppercase tracking-[1.8px] text-foreground-muted">
        {eyebrow}
      </Text>

      <Text className="mt-5 text-[34px] leading-[39px] tracking-[-1.3px] text-foreground">
        {title}
      </Text>

      <Text className="mt-4 text-body leading-7 text-foreground-muted">
        {description}
      </Text>
    </View>
  );
}
EOF

cat > "mobile/src/components/onboarding/OnboardingProgress.tsx" <<'EOF'
// mobile/src/components/onboarding/OnboardingProgress.tsx
import { Text, View } from "react-native";

type OnboardingProgressProps = {
  current: number;
  total: number;
};

export function OnboardingProgress({
  current,
  total
}: OnboardingProgressProps) {
  const width = `${Math.max(8, (current / total) * 100)}%`;

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-detail font-semibold text-foreground-muted">
          etapa {current}/{total}
        </Text>

        <Text className="text-detail text-foreground-muted">
          conta oficial
        </Text>
      </View>

      <View className="mt-3 h-[3px] overflow-hidden rounded-full bg-border">
        <View className="h-full rounded-full bg-foreground" style={{ width }} />
      </View>
    </View>
  );
}
EOF

cat > "mobile/src/types/official-onboarding.types.ts" <<'EOF'
// mobile/src/types/official-onboarding.types.ts
export type OfficialOnboardingStatus = {
  authenticated: boolean;
  completed: boolean;
  profile: {
    id: string;
    user_id: string;
    email: string;
    full_name: string;
    nickname?: string | null;
    username?: string | null;
    birth_date: string;
    age_years: number;
    is_minor: boolean;
    city: string;
    state_code?: string | null;
    country_code: string;
    species_code: string;
    stage_code: string;
    inclination_code: string;
    onboarding_status: string;
    completed_at?: string | null;
    ecosystem_profile_id?: string | null;
    botanic_identity_id?: string | null;
  } | null;
};

export type CompleteOfficialOnboardingInput = {
  email: string;
  fullName: string;
  nickname: string;
  username: string;
  birthDate: string;
  city: string;
  stateCode: string;
  countryCode: string;
  privateTargetSlug: string;
};

export type CompleteOfficialOnboardingResult = {
  completed: boolean;
  reason?: string;
  profile_id?: string;
  ecosystem_profile_id?: string;
  botanic_identity_id?: string;
  is_minor?: boolean;
  age_years?: number;
  success_route?: string;
};
EOF

cat > "mobile/src/schemas/official-onboarding.schemas.ts" <<'EOF'
// mobile/src/schemas/official-onboarding.schemas.ts
import { z } from "zod";

export const officialOnboardingStatusSchema = z.object({
  authenticated: z.boolean(),
  completed: z.boolean(),
  profile: z
    .object({
      id: z.string().uuid(),
      user_id: z.string().uuid(),
      email: z.string().email(),
      full_name: z.string(),
      nickname: z.string().nullable().optional(),
      username: z.string().nullable().optional(),
      birth_date: z.string(),
      age_years: z.number().int(),
      is_minor: z.boolean(),
      city: z.string(),
      state_code: z.string().nullable().optional(),
      country_code: z.string(),
      species_code: z.string(),
      stage_code: z.string(),
      inclination_code: z.string(),
      onboarding_status: z.string(),
      completed_at: z.string().nullable().optional(),
      ecosystem_profile_id: z.string().uuid().nullable().optional(),
      botanic_identity_id: z.string().uuid().nullable().optional()
    })
    .nullable()
});

export const completeOfficialOnboardingResultSchema = z.object({
  completed: z.boolean(),
  reason: z.string().optional(),
  profile_id: z.string().uuid().optional(),
  ecosystem_profile_id: z.string().uuid().optional(),
  botanic_identity_id: z.string().uuid().optional(),
  is_minor: z.boolean().optional(),
  age_years: z.number().int().optional(),
  success_route: z.string().optional()
});

export const officialAccountStepSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula.")
    .regex(/[a-z]/, "Inclua pelo menos uma letra minúscula.")
    .regex(/[0-9]/, "Inclua pelo menos um número.")
});

export const officialProfileStepSchema = z.object({
  fullName: z.string().min(2, "Informe o nome.").max(120),
  nickname: z.string().min(1, "Informe um apelido.").max(48),
  username: z
    .string()
    .min(3, "Use pelo menos 3 caracteres.")
    .max(24)
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minúsculas, números e _.")
});

export const officialPersonalStepSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD."),
  city: z.string().min(2, "Informe a cidade.").max(120),
  stateCode: z
    .string()
    .min(2, "UF com 2 letras.")
    .max(2, "UF com 2 letras.")
    .regex(/^[A-Za-z]{2}$/, "Use apenas a sigla da UF."),
  countryCode: z.string().default("BRA")
});

export type OfficialAccountStep = z.infer<typeof officialAccountStepSchema>;
export type OfficialProfileStep = z.infer<typeof officialProfileStepSchema>;
export type OfficialPersonalStep = z.infer<typeof officialPersonalStepSchema>;
EOF

cat > "mobile/src/services/official-onboarding.service.ts" <<'EOF'
// mobile/src/services/official-onboarding.service.ts
import type { SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/config/env";
import { supabase } from "@/lib/supabase";
import {
  completeOfficialOnboardingResultSchema,
  officialOnboardingStatusSchema
} from "@/schemas/official-onboarding.schemas";
import type {
  CompleteOfficialOnboardingInput,
  CompleteOfficialOnboardingResult,
  OfficialOnboardingStatus
} from "@/types/official-onboarding.types";

class OfficialOnboardingError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SUPABASE_NOT_CONFIGURED"
      | "AUTH_FAILED"
      | "RPC_FAILED"
      | "INVALID_RESPONSE"
  ) {
    super(message);
    this.name = "OfficialOnboardingError";
  }
}

function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured || !supabase) {
    throw new OfficialOnboardingError(
      "Supabase não configurado.",
      "SUPABASE_NOT_CONFIGURED"
    );
  }

  return supabase;
}

function warn(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "unknown_error";
  console.warn(`[IRIS_OFFICIAL_ONBOARDING_${scope}]`, { message });
}

export async function getMyOfficialOnboardingStatus(): Promise<OfficialOnboardingStatus> {
  const client = getSupabaseClient();

  const session = await client.auth.getSession();

  if (!session.data.session) {
    return {
      authenticated: false,
      completed: false,
      profile: null
    };
  }

  const { data, error } = await client.rpc("get_my_mobile_official_onboarding");

  if (error) {
    warn("STATUS_RPC_FAILED", error);
    throw new OfficialOnboardingError("Falha ao ler onboarding.", "RPC_FAILED");
  }

  const parsed = officialOnboardingStatusSchema.safeParse(data);

  if (!parsed.success) {
    warn("STATUS_INVALID_RESPONSE", parsed.error);
    throw new OfficialOnboardingError(
      "Resposta inválida do onboarding.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function convertAnonymousSessionToOfficialAccount(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{
  emailConfirmationRequired: boolean;
}> {
  const client = getSupabaseClient();

  const { data, error } = await client.auth.updateUser({
    email: input.email,
    password: input.password,
    data: {
      full_name: input.fullName,
      onboarding_source: "iris_mobile_private_first_access"
    }
  });

  if (error) {
    warn("UPDATE_USER_FAILED", error);
    throw new OfficialOnboardingError(
      "Não foi possível criar a conta oficial.",
      "AUTH_FAILED"
    );
  }

  return {
    emailConfirmationRequired:
      Boolean(data.user?.new_email) || !Boolean(data.user?.email_confirmed_at)
  };
}

export async function signInOfficialAccount(input: {
  email: string;
  password: string;
}): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.auth.signInWithPassword({
    email: input.email,
    password: input.password
  });

  if (error) {
    warn("SIGN_IN_FAILED", error);
    throw new OfficialOnboardingError(
      "Ainda não consegui confirmar esse e-mail.",
      "AUTH_FAILED"
    );
  }
}

export async function completeOfficialOnboarding(
  input: CompleteOfficialOnboardingInput
): Promise<CompleteOfficialOnboardingResult> {
  const client = getSupabaseClient();

  const { data, error } = await client.rpc("complete_mobile_official_onboarding", {
    p_email: input.email,
    p_full_name: input.fullName,
    p_nickname: input.nickname,
    p_username: input.username,
    p_birth_date: input.birthDate,
    p_city: input.city,
    p_state_code: input.stateCode.toUpperCase(),
    p_country_code: input.countryCode.toUpperCase(),
    p_private_target_slug: input.privateTargetSlug
  });

  if (error) {
    warn("COMPLETE_RPC_FAILED", error);
    throw new OfficialOnboardingError(
      "Não foi possível concluir o onboarding.",
      "RPC_FAILED"
    );
  }

  const parsed = completeOfficialOnboardingResultSchema.safeParse(data);

  if (!parsed.success) {
    warn("COMPLETE_INVALID_RESPONSE", parsed.error);
    throw new OfficialOnboardingError(
      "Resposta inválida ao concluir onboarding.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}
EOF

cat > "mobile/src/services/private-login.service.ts" <<'EOF'
// mobile/src/services/private-login.service.ts
import type { Session, SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/config/env";
import { supabase } from "@/lib/supabase";
import {
  myPrivateAccessResultSchema,
  privateLoginEntryPointsSchema,
  privateLoginQuizSchema,
  verifyPrivateLoginResultSchema,
  verifyPrivateLoginStepResultSchema
} from "@/schemas/private-login.schemas";
import type {
  MyPrivateAccessResult,
  PrivateLoginAnswerPayload,
  PrivateLoginEntryPoints,
  PrivateLoginQuiz,
  VerifyPrivateLoginResult,
  VerifyPrivateLoginStepResult
} from "@/types/private-login.types";

class IrisPrivateLoginError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SUPABASE_NOT_CONFIGURED"
      | "ANONYMOUS_AUTH_FAILED"
      | "ANONYMOUS_AUTH_DISABLED"
      | "RPC_FAILED"
      | "INVALID_RESPONSE"
  ) {
    super(message);
    this.name = "IrisPrivateLoginError";
  }
}

function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured || !supabase) {
    throw new IrisPrivateLoginError(
      "O Supabase ainda não está configurado.",
      "SUPABASE_NOT_CONFIGURED"
    );
  }

  return supabase;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return "unknown_error";
}

function isAnonymousAuthDisabled(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("anonymous sign-ins are disabled") ||
    message.includes("anonymous sign in is disabled") ||
    message.includes("anonymous provider is disabled")
  );
}

function logPrivateLoginWarning(scope: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.warn(`[IRIS_PRIVATE_LOGIN_${scope}]`, { message });
}

export async function ensureAnonymousPrivateSession(): Promise<Session> {
  const client = getSupabaseClient();

  const currentSession = await client.auth.getSession();

  if (currentSession.error) {
    logPrivateLoginWarning("GET_SESSION_FAILED", currentSession.error);
  }

  if (currentSession.data.session) {
    return currentSession.data.session;
  }

  const { data, error } = await client.auth.signInAnonymously();

  if (error || !data.session) {
    if (isAnonymousAuthDisabled(error)) {
      logPrivateLoginWarning("ANONYMOUS_AUTH_DISABLED", error);

      throw new IrisPrivateLoginError(
        "Anonymous Sign-ins está desativado no Supabase.",
        "ANONYMOUS_AUTH_DISABLED"
      );
    }

    logPrivateLoginWarning("ANONYMOUS_AUTH_FAILED", error);

    throw new IrisPrivateLoginError(
      "Não foi possível abrir uma sessão privada.",
      "ANONYMOUS_AUTH_FAILED"
    );
  }

  return data.session;
}

export async function fetchPrivateLoginEntryPoints(): Promise<PrivateLoginEntryPoints> {
  const client = getSupabaseClient();

  const { data, error } = await client.rpc("get_private_login_entry_points");

  if (error) {
    logPrivateLoginWarning("ENTRY_POINTS_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível carregar as entradas.",
      "RPC_FAILED"
    );
  }

  const parsed = privateLoginEntryPointsSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("ENTRY_POINTS_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de entradas veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function fetchPrivateLoginQuiz(
  targetSlug: string
): Promise<PrivateLoginQuiz> {
  const client = getSupabaseClient();

  const { data, error } = await client.rpc("get_private_login_quiz", {
    p_target_slug: targetSlug
  });

  if (error) {
    logPrivateLoginWarning("QUIZ_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível carregar o quiz.",
      "RPC_FAILED"
    );
  }

  const parsed = privateLoginQuizSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("QUIZ_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta do quiz veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function verifyPrivateLoginQuizStep(input: {
  targetSlug: string;
  questionId: string;
  optionId: string;
}): Promise<VerifyPrivateLoginStepResult> {
  const client = getSupabaseClient();

  try {
    await ensureAnonymousPrivateSession();
  } catch (error) {
    if (
      error instanceof IrisPrivateLoginError &&
      error.code === "ANONYMOUS_AUTH_DISABLED"
    ) {
      return {
        valid: false,
        correct: false,
        reason: "anonymous_disabled"
      };
    }

    throw error;
  }

  const { data, error } = await client.rpc("verify_private_login_quiz_step", {
    p_target_slug: input.targetSlug,
    p_question_id: input.questionId,
    p_option_id: input.optionId,
    p_device_label: "iris-mobile"
  });

  if (error) {
    logPrivateLoginWarning("VERIFY_STEP_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível verificar esta resposta.",
      "RPC_FAILED"
    );
  }

  const parsed = verifyPrivateLoginStepResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("VERIFY_STEP_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de verificação por etapa veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function verifyPrivateLoginQuiz(input: {
  targetSlug: string;
  answers: PrivateLoginAnswerPayload[];
}): Promise<VerifyPrivateLoginResult> {
  const client = getSupabaseClient();

  try {
    await ensureAnonymousPrivateSession();
  } catch (error) {
    if (
      error instanceof IrisPrivateLoginError &&
      error.code === "ANONYMOUS_AUTH_DISABLED"
    ) {
      return {
        granted: false,
        reason: "anonymous_disabled"
      };
    }

    throw error;
  }

  const { data, error } = await client.rpc("verify_private_login_quiz", {
    p_target_slug: input.targetSlug,
    p_answers: input.answers,
    p_device_label: "iris-mobile"
  });

  if (error) {
    logPrivateLoginWarning("VERIFY_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível verificar as respostas.",
      "RPC_FAILED"
    );
  }

  const parsed = verifyPrivateLoginResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("VERIFY_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de verificação veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function getMyPrivateAccess(): Promise<MyPrivateAccessResult> {
  const client = getSupabaseClient();

  const currentSession = await client.auth.getSession();

  if (!currentSession.data.session) {
    return {
      authenticated: false,
      sessions: []
    };
  }

  const { data, error } = await client.rpc("get_my_private_access");

  if (error) {
    logPrivateLoginWarning("MY_ACCESS_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível recuperar o acesso privado.",
      "RPC_FAILED"
    );
  }

  const parsed = myPrivateAccessResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginWarning("MY_ACCESS_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de acesso privado veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function signOutPrivateSession(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut({
    scope: "local"
  });

  if (error) {
    logPrivateLoginWarning("SIGN_OUT_FAILED", error);
  }
}
EOF

cat > "mobile/app/(auth)/entry.tsx" <<'EOF'
// mobile/app/(auth)/entry.tsx
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
EOF

cat > "mobile/app/index.tsx" <<'EOF'
// mobile/app/index.tsx
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
EOF

python - <<'PY'
from pathlib import Path

path = Path("mobile/app/(auth)/private-login/[slug].tsx")
text = path.read_text(encoding="utf-8")

text = text.replace(
'''      router.replace(normalizePrivateSuccessRoute(successRoute));''',
'''      router.replace("/official-onboarding");'''
)

path.write_text(text, encoding="utf-8")
PY

cat > "mobile/app/(auth)/official-onboarding.tsx" <<'EOF'
// mobile/app/(auth)/official-onboarding.tsx
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { Check, ChevronLeft, Mail, MapPin, ShieldCheck, Sprout } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthResponsiveShell } from "@/components/auth/AuthResponsiveShell";
import { AuthTranslucentPanel } from "@/components/auth/AuthTranslucentPanel";
import { IrisButton } from "@/components/ui/IrisButton";
import { IrisTextInput } from "@/components/ui/IrisTextInput";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OnboardingStepHeader } from "@/components/onboarding/OnboardingStepHeader";
import {
  officialAccountStepSchema,
  officialPersonalStepSchema,
  officialProfileStepSchema
} from "@/schemas/official-onboarding.schemas";
import {
  completeOfficialOnboarding,
  convertAnonymousSessionToOfficialAccount,
  getMyOfficialOnboardingStatus,
  signInOfficialAccount
} from "@/services/official-onboarding.service";

type Step = 1 | 2 | 3 | 4;

type FieldErrors = Record<string, string | null>;

export default function OfficialOnboardingScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();

  const privateTargetSlug = Array.isArray(params.slug)
    ? params.slug[0] ?? "isabela"
    : params.slug ?? "isabela";

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [username, setUsername] = useState("");

  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [countryCode] = useState("BRA");

  const statusQuery = useQuery({
    queryKey: ["official-onboarding-status"],
    queryFn: getMyOfficialOnboardingStatus
  });

  const accountMutation = useMutation({
    mutationFn: () =>
      convertAnonymousSessionToOfficialAccount({
        email,
        password,
        fullName: fullName || nickname || "IRIS"
      }),
    onSuccess: (result) => {
      setNotice(
        result.emailConfirmationRequired
          ? "Enviamos a confirmação para o e-mail. Confirme e toque em “Já confirmei”."
          : "Conta oficial criada. Vamos continuar."
      );
      setStep(2);
    },
    onError: () => {
      setNotice("Não consegui criar a conta oficial. Verifique o e-mail e tente novamente.");
    }
  });

  const signInMutation = useMutation({
    mutationFn: () => signInOfficialAccount({ email, password }),
    onSuccess: () => {
      setNotice("E-mail confirmado. Agora vamos finalizar seu perfil.");
      setStep(3);
    },
    onError: () => {
      setNotice("Ainda não consegui entrar. Confirme o e-mail e tente novamente.");
    }
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      completeOfficialOnboarding({
        email,
        fullName,
        nickname,
        username,
        birthDate,
        city,
        stateCode,
        countryCode,
        privateTargetSlug
      }),
    onSuccess: (result) => {
      if (!result.completed) {
        setNotice(
          result.reason === "minimum_age"
            ? "Essa idade exige uma conta Kids. Vamos tratar esse fluxo depois."
            : "Não consegui concluir o onboarding oficial."
        );
        return;
      }

      router.replace("/home" as Href);
    },
    onError: () => {
      setNotice("Não consegui concluir o onboarding oficial agora.");
    }
  });

  const agePreview = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;

    const birth = new Date(`${birthDate}T00:00:00`);
    const now = new Date();

    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age -= 1;
    }

    if (!Number.isFinite(age)) return null;
    return age;
  }, [birthDate]);

  function normalizeUsername(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 24);
  }

  function validateAccount() {
    const parsed = officialAccountStepSchema.safeParse({ email, password });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        email: flattened.email?.[0] ?? null,
        password: flattened.password?.[0] ?? null
      });
      return false;
    }

    setErrors({});
    return true;
  }

  function validateProfile() {
    const parsed = officialProfileStepSchema.safeParse({
      fullName,
      nickname,
      username
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        fullName: flattened.fullName?.[0] ?? null,
        nickname: flattened.nickname?.[0] ?? null,
        username: flattened.username?.[0] ?? null
      });
      return false;
    }

    setErrors({});
    return true;
  }

  function validatePersonal() {
    const parsed = officialPersonalStepSchema.safeParse({
      birthDate,
      city,
      stateCode,
      countryCode
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors({
        birthDate: flattened.birthDate?.[0] ?? null,
        city: flattened.city?.[0] ?? null,
        stateCode: flattened.stateCode?.[0] ?? null
      });
      return false;
    }

    setErrors({});
    return true;
  }

  async function handleNext() {
    setNotice(null);

    if (step === 1) {
      if (!validateAccount()) return;
      accountMutation.mutate();
      return;
    }

    if (step === 2) {
      signInMutation.mutate();
      return;
    }

    if (step === 3) {
      if (!validateProfile()) return;
      setStep(4);
      return;
    }

    if (step === 4) {
      if (!validatePersonal()) return;
      completeMutation.mutate();
    }
  }

  function handleBack() {
    setNotice(null);

    if (step > 1) {
      setStep((current) => (current - 1) as Step);
      return;
    }

    router.back();
  }

  function getButtonLabel() {
    if (accountMutation.isPending) return "Criando conta...";
    if (signInMutation.isPending) return "Verificando...";
    if (completeMutation.isPending) return "Finalizando...";

    if (step === 1) return "Criar conta oficial";
    if (step === 2) return "Já confirmei";
    if (step === 3) return "Continuar";
    return "Concluir onboarding";
  }

  const loading =
    accountMutation.isPending ||
    signInMutation.isPending ||
    completeMutation.isPending;

  return (
    <AuthResponsiveShell>
      {({ isTablet }) => (
        <View
          className={
            isTablet
              ? "min-h-[680px] flex-row items-center justify-between gap-14"
              : "gap-8"
          }
        >
          <View className={isTablet ? "flex-1" : undefined}>
            <Pressable
              accessibilityRole="button"
              onPress={handleBack}
              className="mb-8 h-11 w-11 items-center justify-center rounded-full bg-[#FAF7F2]/70"
            >
              <ChevronLeft size={24} color="#111111" />
            </Pressable>

            <OnboardingProgress current={step} total={4} />

            <View className="mt-10">
              {step === 1 ? (
                <OnboardingStepHeader
                  eyebrow="primeiro acesso"
                  title="Agora vamos criar sua conta oficial."
                  description="O quiz abriu a porta privada. Agora o IRIS precisa transformar este acesso em uma conta real, segura e recuperável."
                />
              ) : null}

              {step === 2 ? (
                <OnboardingStepHeader
                  eyebrow="confirmação"
                  title="Confirme seu e-mail."
                  description="Abra sua caixa de entrada, confirme o e-mail do Supabase/IRIS e volte para continuar."
                />
              ) : null}

              {step === 3 ? (
                <OnboardingStepHeader
                  eyebrow="identidade"
                  title="Como a IRIS deve chamar você?"
                  description="Essas informações formam a base do seu Account Profile dentro do ecossistema."
                />
              ) : null}

              {step === 4 ? (
                <OnboardingStepHeader
                  eyebrow="flora"
                  title="Sua Flora inicial."
                  description="Cidade, idade e estágio inicial ajudam a IRIS criar sua primeira identidade botânica oficial."
                />
              ) : null}
            </View>

            {agePreview !== null ? (
              <View className="mt-8 rounded-[28px] border border-border/80 bg-[#FAF7F2]/55 px-5 py-4">
                <Text className="text-caption font-semibold text-foreground">
                  Idade detectada: {agePreview} anos
                </Text>
                <Text className="mt-1 text-detail leading-5 text-foreground-muted">
                  {agePreview < 18
                    ? "Esse perfil será tratado futuramente como conta Kids/menor."
                    : "Esse perfil segue como conta adulta comum."}
                </Text>
              </View>
            ) : null}
          </View>

          <View className={isTablet ? "flex-1" : undefined}>
            <AuthTranslucentPanel intense>
              {step === 1 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <Mail size={20} color="#FFFFFF" />
                  </View>

                  <IrisTextInput
                    label="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="isabela@email.com"
                    error={errors.email}
                  />

                  <IrisTextInput
                    label="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="mínimo 8 caracteres"
                    error={errors.password}
                  />
                </View>
              ) : null}

              {step === 2 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <ShieldCheck size={20} color="#FFFFFF" />
                  </View>

                  <Text className="text-[25px] leading-[31px] tracking-[-0.8px] text-foreground">
                    Depois de confirmar, volte aqui.
                  </Text>

                  <Text className="text-caption leading-6 text-foreground-muted">
                    Vamos tentar entrar com seu e-mail e senha. Se a confirmação
                    ainda não tiver sido feita, a IRIS vai pedir para aguardar.
                  </Text>
                </View>
              ) : null}

              {step === 3 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <Check size={20} color="#FFFFFF" />
                  </View>

                  <IrisTextInput
                    label="Nome completo"
                    value={fullName}
                    onChangeText={(value) => {
                      setFullName(value);
                      if (!username) setUsername(normalizeUsername(value.split(" ")[0] ?? ""));
                    }}
                    placeholder="Isabela Vaz"
                    error={errors.fullName}
                  />

                  <IrisTextInput
                    label="Apelido"
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="Isa"
                    error={errors.nickname}
                  />

                  <IrisTextInput
                    label="Usuário"
                    value={username}
                    onChangeText={(value) => setUsername(normalizeUsername(value))}
                    autoCapitalize="none"
                    placeholder="isabela"
                    error={errors.username}
                  />
                </View>
              ) : null}

              {step === 4 ? (
                <View className="gap-5">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-foreground">
                    <Sprout size={20} color="#FFFFFF" />
                  </View>

                  <IrisTextInput
                    label="Nascimento"
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholder="AAAA-MM-DD"
                    keyboardType="numbers-and-punctuation"
                    error={errors.birthDate}
                  />

                  <IrisTextInput
                    label="Cidade"
                    value={city}
                    onChangeText={setCity}
                    placeholder="São Paulo"
                    error={errors.city}
                  />

                  <IrisTextInput
                    label="UF"
                    value={stateCode}
                    onChangeText={(value) => setStateCode(value.toUpperCase().slice(0, 2))}
                    placeholder="SP"
                    autoCapitalize="characters"
                    error={errors.stateCode}
                  />

                  <View className="rounded-[24px] border border-border/80 bg-background/45 px-4 py-4">
                    <View className="flex-row items-center gap-3">
                      <MapPin size={18} color="#111111" />
                      <Text className="flex-1 text-caption leading-5 text-foreground-muted">
                        Flora inicial: IRIS_PARTNER • SEMENTE • NULO
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {notice ? (
                <View className="mt-6 rounded-[24px] border border-border/80 bg-background/55 px-4 py-4">
                  <Text className="text-caption leading-6 text-foreground-muted">
                    {notice}
                  </Text>
                </View>
              ) : null}

              {statusQuery.data?.completed ? (
                <View className="mt-6 rounded-[24px] border border-success/30 bg-[#EDF7F2] px-4 py-4">
                  <Text className="text-caption font-semibold text-foreground">
                    Onboarding já concluído.
                  </Text>
                </View>
              ) : null}

              <View className="mt-7">
                <IrisButton
                  label={getButtonLabel()}
                  loading={loading}
                  disabled={loading}
                  onPress={handleNext}
                />

                <Text className="mt-4 text-center text-detail leading-5 text-foreground-muted">
                  Este processo cria Account, perfil público interno e Flora
                  inicial no banco.
                </Text>
              </View>
            </AuthTranslucentPanel>
          </View>
        </View>
      )}
    </AuthResponsiveShell>
  );
}
EOF

cd mobile
npm run typecheck
