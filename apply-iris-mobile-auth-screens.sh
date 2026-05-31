#!/usr/bin/env bash
set -euo pipefail

mkdir -p "mobile/app/(auth)/private-login"
mkdir -p "mobile/app/(tabs)"
mkdir -p "mobile/src/components/ui"
mkdir -p "mobile/src/constants"
mkdir -p "mobile/src/schemas"
mkdir -p "mobile/src/services"
mkdir -p "mobile/src/stores"
mkdir -p "mobile/src/types"
mkdir -p "mobile/src/utils"

cat > "mobile/src/utils/cn.ts" <<'EOF'
// mobile/src/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
EOF

cat > "mobile/src/utils/routes.ts" <<'EOF'
// mobile/src/utils/routes.ts
import type { Href } from "expo-router";

export function normalizePrivateSuccessRoute(route: string | null | undefined): Href {
  if (!route || route === "/(tabs)" || route === "(tabs)") {
    return "/home" as Href;
  }

  return route as Href;
}
EOF

cat > "mobile/src/constants/auth-copy.ts" <<'EOF'
// mobile/src/constants/auth-copy.ts
export const authCopy = {
  brand: "IRIS",
  signature: "IRIS • feito para lembrar",
  splashSubtitle: "Um lugar para lembrar quem você é.",
  entryTitle: "Antes de entrar, escolha como a IRIS deve te reconhecer.",
  entrySubtitle:
    "Este primeiro acesso é privado. Algumas portas ainda estão sendo construídas.",
  newUserTitle: "Sou novo usuário",
  newUserDescription: "O registro público ainda não foi liberado.",
  isabelaFallbackLabel: "Sou a Isabela",
  quizIntroTitle: "A IRIS sabe quando uma resposta é memória.",
  quizIntroSubtitle:
    "Não é uma senha. É só uma forma bonita de confirmar que é você.",
  quizFailure:
    "Ainda não abriu. Respira, pensa em nós dois e tenta de novo com calma.",
  quizRateLimit:
    "A IRIS pausou novas tentativas por alguns minutos para proteger este espaço.",
  supabaseMissing:
    "O Supabase ainda não está configurado no mobile/.env.local.",
  anonymousMissing:
    "Ative Anonymous Sign-ins no Supabase para usar este acesso sem e-mail e senha."
} as const;
EOF

cat > "mobile/src/types/private-login.types.ts" <<'EOF'
// mobile/src/types/private-login.types.ts
export type PrivateLoginEntry = {
  slug: string;
  label: string;
  kind: string;
  relationship_label?: string | null;
};

export type PrivateLoginEntryPoints = {
  enabled: boolean;
  entries: PrivateLoginEntry[];
};

export type PrivateLoginQuizOption = {
  id: string;
  label: string;
  sort_order: number;
};

export type PrivateLoginQuizQuestion = {
  id: string;
  prompt: string;
  helper_text?: string | null;
  sort_order: number;
  options: PrivateLoginQuizOption[];
};

export type PrivateLoginQuizTarget = {
  slug: string;
  label: string;
  name: string;
  required_question_count: number;
  required_correct_answers: number;
};

export type PrivateLoginQuiz = {
  enabled: boolean;
  target: PrivateLoginQuizTarget | null;
  questions: PrivateLoginQuizQuestion[];
};

export type PrivateLoginAnswerPayload = {
  question_id: string;
  option_id: string;
};

export type PrivateAccessProfile = {
  target_id?: string;
  slug: string;
  label?: string | null;
  name?: string | null;
  full_name?: string | null;
  nickname?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  profile_payload?: Record<string, unknown>;
};

export type VerifyPrivateLoginResult = {
  granted: boolean;
  reason?: string;
  session_id?: string;
  success_route?: string;
  correct_count?: number;
  required_count?: number;
  profile?: PrivateAccessProfile;
};

export type PrivateAccessSession = {
  session_id: string;
  target_id?: string | null;
  slug: string;
  label?: string | null;
  name?: string | null;
  full_name?: string | null;
  nickname?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  success_route?: string | null;
  profile_payload?: Record<string, unknown>;
  granted_at?: string | null;
  expires_at?: string | null;
};

export type MyPrivateAccessResult = {
  authenticated: boolean;
  sessions: PrivateAccessSession[];
};
EOF

cat > "mobile/src/schemas/private-login.schemas.ts" <<'EOF'
// mobile/src/schemas/private-login.schemas.ts
import { z } from "zod";

export const privateLoginEntrySchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  kind: z.string().min(1),
  relationship_label: z.string().nullable().optional()
});

export const privateLoginEntryPointsSchema = z.object({
  enabled: z.boolean(),
  entries: z.array(privateLoginEntrySchema)
});

export const privateLoginQuizOptionSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  sort_order: z.number().int()
});

export const privateLoginQuizQuestionSchema = z.object({
  id: z.string().uuid(),
  prompt: z.string().min(1),
  helper_text: z.string().nullable().optional(),
  sort_order: z.number().int(),
  options: z.array(privateLoginQuizOptionSchema).length(3)
});

export const privateLoginQuizTargetSchema = z.object({
  slug: z.string().min(1),
  label: z.string().min(1),
  name: z.string().min(1),
  required_question_count: z.number().int().min(1),
  required_correct_answers: z.number().int().min(1)
});

export const privateLoginQuizSchema = z.object({
  enabled: z.boolean(),
  target: privateLoginQuizTargetSchema.nullable(),
  questions: z.array(privateLoginQuizQuestionSchema)
});

export const privateLoginAnswerPayloadSchema = z.object({
  question_id: z.string().uuid(),
  option_id: z.string().uuid()
});

export const verifyPrivateLoginResultSchema = z.object({
  granted: z.boolean(),
  reason: z.string().optional(),
  session_id: z.string().uuid().optional(),
  success_route: z.string().optional(),
  correct_count: z.number().int().optional(),
  required_count: z.number().int().optional(),
  profile: z
    .object({
      target_id: z.string().uuid().optional(),
      slug: z.string().min(1),
      label: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      full_name: z.string().nullable().optional(),
      nickname: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
      avatar_url: z.string().nullable().optional(),
      profile_payload: z.record(z.unknown()).optional().default({})
    })
    .optional()
});

export const privateAccessSessionSchema = z.object({
  session_id: z.string().uuid(),
  target_id: z.string().uuid().nullable().optional(),
  slug: z.string().min(1),
  label: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  success_route: z.string().nullable().optional(),
  profile_payload: z.record(z.unknown()).optional().default({}),
  granted_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional()
});

export const myPrivateAccessResultSchema = z.object({
  authenticated: z.boolean(),
  sessions: z.array(privateAccessSessionSchema)
});
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
  verifyPrivateLoginResultSchema
} from "@/schemas/private-login.schemas";
import type {
  MyPrivateAccessResult,
  PrivateLoginAnswerPayload,
  PrivateLoginEntryPoints,
  PrivateLoginQuiz,
  VerifyPrivateLoginResult
} from "@/types/private-login.types";

class IrisPrivateLoginError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SUPABASE_NOT_CONFIGURED"
      | "ANONYMOUS_AUTH_FAILED"
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

function logPrivateLoginError(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "unknown_error";
  console.error(`[IRIS_PRIVATE_LOGIN_${scope}]`, { message });
}

export async function ensureAnonymousPrivateSession(): Promise<Session> {
  const client = getSupabaseClient();

  const currentSession = await client.auth.getSession();

  if (currentSession.error) {
    logPrivateLoginError("GET_SESSION_FAILED", currentSession.error);
  }

  if (currentSession.data.session) {
    return currentSession.data.session;
  }

  const { data, error } = await client.auth.signInAnonymously();

  if (error || !data.session) {
    logPrivateLoginError("ANONYMOUS_AUTH_FAILED", error);
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
    logPrivateLoginError("ENTRY_POINTS_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível carregar as entradas.",
      "RPC_FAILED"
    );
  }

  const parsed = privateLoginEntryPointsSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginError("ENTRY_POINTS_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de entradas veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}

export async function fetchPrivateLoginQuiz(targetSlug: string): Promise<PrivateLoginQuiz> {
  const client = getSupabaseClient();

  const { data, error } = await client.rpc("get_private_login_quiz", {
    p_target_slug: targetSlug
  });

  if (error) {
    logPrivateLoginError("QUIZ_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível carregar o quiz.",
      "RPC_FAILED"
    );
  }

  const parsed = privateLoginQuizSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginError("QUIZ_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta do quiz veio em formato inválido.",
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

  await ensureAnonymousPrivateSession();

  const { data, error } = await client.rpc("verify_private_login_quiz", {
    p_target_slug: input.targetSlug,
    p_answers: input.answers,
    p_device_label: "iris-mobile"
  });

  if (error) {
    logPrivateLoginError("VERIFY_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível verificar as respostas.",
      "RPC_FAILED"
    );
  }

  const parsed = verifyPrivateLoginResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginError("VERIFY_INVALID_RESPONSE", parsed.error);
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
    logPrivateLoginError("MY_ACCESS_RPC_FAILED", error);
    throw new IrisPrivateLoginError(
      "Não foi possível recuperar o acesso privado.",
      "RPC_FAILED"
    );
  }

  const parsed = myPrivateAccessResultSchema.safeParse(data);

  if (!parsed.success) {
    logPrivateLoginError("MY_ACCESS_INVALID_RESPONSE", parsed.error);
    throw new IrisPrivateLoginError(
      "A resposta de acesso privado veio em formato inválido.",
      "INVALID_RESPONSE"
    );
  }

  return parsed.data;
}
EOF

cat > "mobile/src/stores/private-access.store.ts" <<'EOF'
// mobile/src/stores/private-access.store.ts
import { create } from "zustand";

import type { PrivateAccessSession } from "@/types/private-login.types";

type PrivateAccessStore = {
  activeAccess: PrivateAccessSession | null;
  setActiveAccess: (session: PrivateAccessSession | null) => void;
  clearActiveAccess: () => void;
};

export const usePrivateAccessStore = create<PrivateAccessStore>((set) => ({
  activeAccess: null,
  setActiveAccess: (session) => set({ activeAccess: session }),
  clearActiveAccess: () => set({ activeAccess: null })
}));
EOF

cat > "mobile/src/components/ui/IrisButton.tsx" <<'EOF'
// mobile/src/components/ui/IrisButton.tsx
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { cn } from "@/utils/cn";

type IrisButtonVariant = "primary" | "secondary" | "ghost";

type IrisButtonProps = PressableProps & {
  label: string;
  variant?: IrisButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<IrisButtonVariant, string> = {
  primary: "bg-foreground border-foreground",
  secondary: "bg-surface border-border",
  ghost: "bg-transparent border-transparent"
};

const textClasses: Record<IrisButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-foreground",
  ghost: "text-foreground-muted"
};

export function IrisButton({
  label,
  variant = "primary",
  loading = false,
  disabled,
  fullWidth = true,
  className,
  ...props
}: IrisButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        "min-h-[56px] items-center justify-center rounded-xl border px-5",
        variantClasses[variant],
        fullWidth ? "w-full" : "self-start",
        isDisabled && "opacity-45",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#111111"} />
      ) : (
        <Text
          className={cn(
            "text-center text-[15px] font-semibold tracking-[-0.2px]",
            textClasses[variant]
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
EOF

cat > "mobile/src/components/ui/IrisScreen.tsx" <<'EOF'
// mobile/src/components/ui/IrisScreen.tsx
import { ScrollView, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/utils/cn";

type IrisScreenProps = ViewProps & {
  scroll?: boolean;
};

export function IrisScreen({
  children,
  scroll = true,
  className,
  ...props
}: IrisScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-background" {...props}>
        <View className={cn("flex-1 px-7 pb-8 pt-5", className)}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" {...props}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn("grow px-7 pb-8 pt-5", className)}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
EOF

cat > "mobile/src/components/ui/IrisQuietCard.tsx" <<'EOF'
// mobile/src/components/ui/IrisQuietCard.tsx
import { View, type ViewProps } from "react-native";

import { cn } from "@/utils/cn";

export function IrisQuietCard({ children, className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "rounded-3xl border border-border bg-surface px-5 py-5",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
EOF

cat > "mobile/app.config.ts" <<'EOF'
// mobile/app.config.ts
import type { ConfigContext, ExpoConfig } from "expo/config";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

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
EOF

cat > "mobile/app/index.tsx" <<'EOF'
// mobile/app/index.tsx
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { authCopy } from "@/constants/auth-copy";
import { getMyPrivateAccess } from "@/services/private-login.service";
import { usePrivateAccessStore } from "@/stores/private-access.store";
import { normalizePrivateSuccessRoute } from "@/utils/routes";

export default function SplashScreen() {
  const router = useRouter();
  const setActiveAccess = usePrivateAccessStore((state) => state.setActiveAccess);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      await new Promise((resolve) => setTimeout(resolve, 1300));

      try {
        const access = await getMyPrivateAccess();
        const firstSession = access.sessions[0];

        if (!mounted) return;

        if (firstSession) {
          setActiveAccess(firstSession);
          router.replace(normalizePrivateSuccessRoute(firstSession.success_route));
          return;
        }
      } catch {
        // O boot não deve expor erro técnico na abertura.
        // Se não conseguir validar sessão, segue para a entrada.
      }

      if (mounted) {
        router.replace("/entry" as Href);
      }
    }

    void boot();

    return () => {
      mounted = false;
    };
  }, [router, setActiveAccess]);

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
          {authCopy.signature}
        </Text>
      </View>
    </View>
  );
}
EOF

cat > "mobile/app/(auth)/entry.tsx" <<'EOF'
// mobile/app/(auth)/entry.tsx
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { ArrowRight, Lock, Sparkles } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { IrisButton } from "@/components/ui/IrisButton";
import { IrisQuietCard } from "@/components/ui/IrisQuietCard";
import { IrisScreen } from "@/components/ui/IrisScreen";
import { authCopy } from "@/constants/auth-copy";
import { isSupabaseConfigured } from "@/config/env";
import { fetchPrivateLoginEntryPoints } from "@/services/private-login.service";
import type { PrivateLoginEntry } from "@/types/private-login.types";

function EntrySkeleton() {
  return (
    <View className="mt-10 gap-4">
      <View className="h-[92px] rounded-3xl border border-border bg-surface opacity-60" />
      <View className="h-[92px] rounded-3xl border border-border bg-surface opacity-40" />
    </View>
  );
}

function PrivateEntryButton({
  entry,
  onPress
}: {
  entry: PrivateLoginEntry;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="rounded-3xl border border-border bg-surface px-5 py-5 active:opacity-80"
    >
      <View className="flex-row items-center gap-4">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
          <Sparkles size={18} color="#FFFFFF" />
        </View>

        <View className="flex-1">
          <Text className="text-[18px] font-semibold text-foreground">
            {entry.label}
          </Text>
          <Text className="mt-1 text-caption leading-5 text-foreground-muted">
            Entrar pelo quiz privado criado para este espaço.
          </Text>
        </View>

        <ArrowRight size={19} color="#111111" />
      </View>
    </Pressable>
  );
}

export default function EntryScreen() {
  const router = useRouter();

  const query = useQuery({
    queryKey: ["private-login-entry-points"],
    queryFn: fetchPrivateLoginEntryPoints,
    enabled: isSupabaseConfigured
  });

  const entries =
    query.data?.entries.length && query.data.enabled
      ? query.data.entries
      : [
          {
            slug: "isabela",
            label: authCopy.isabelaFallbackLabel,
            kind: "personalized_partner",
            relationship_label: "namorada"
          }
        ];

  return (
    <IrisScreen>
      <View className="min-h-full justify-between">
        <View>
          <View className="mt-4 h-10 w-10 items-center justify-center rounded-full border border-border bg-surface">
            <Lock size={17} color="#111111" />
          </View>

          <Text className="mt-12 text-[36px] leading-[42px] tracking-[-1.4px] text-foreground">
            Olá.{"\n"}Como a IRIS deve abrir para você?
          </Text>

          <Text className="mt-5 max-w-[310px] text-body leading-7 text-foreground-muted">
            {authCopy.entrySubtitle}
          </Text>

          {!isSupabaseConfigured ? (
            <IrisQuietCard className="mt-8">
              <Text className="text-caption font-semibold text-foreground">
                Ambiente pendente
              </Text>
              <Text className="mt-2 text-caption leading-5 text-foreground-muted">
                {authCopy.supabaseMissing}
              </Text>
            </IrisQuietCard>
          ) : query.isLoading ? (
            <EntrySkeleton />
          ) : (
            <View className="mt-10 gap-4">
              <Pressable
                accessibilityRole="button"
                disabled
                className="rounded-3xl border border-border bg-surface px-5 py-5 opacity-50"
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-11 w-11 items-center justify-center rounded-full border border-border bg-background">
                    <Text className="text-lg text-foreground">＋</Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-[18px] font-semibold text-foreground">
                      {authCopy.newUserTitle}
                    </Text>
                    <Text className="mt-1 text-caption leading-5 text-foreground-muted">
                      {authCopy.newUserDescription}
                    </Text>
                  </View>
                </View>
              </Pressable>

              {entries.map((entry) => (
                <PrivateEntryButton
                  key={entry.slug}
                  entry={entry}
                  onPress={() =>
                    router.push(`/private-login/${entry.slug}` as Href)
                  }
                />
              ))}
            </View>
          )}
        </View>

        <View className="mt-12">
          <IrisButton
            label="Atualizar entradas"
            variant="ghost"
            onPress={() => void query.refetch()}
            disabled={!isSupabaseConfigured || query.isFetching}
            loading={query.isFetching}
          />

          <Text className="mt-6 text-center text-detail text-foreground-muted">
            {authCopy.signature}
          </Text>
        </View>
      </View>
    </IrisScreen>
  );
}
EOF

cat > "mobile/app/(auth)/private-login/[slug].tsx" <<'EOF'
// mobile/app/(auth)/private-login/[slug].tsx
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Heart, Lock, Sparkles } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { IrisButton } from "@/components/ui/IrisButton";
import { IrisQuietCard } from "@/components/ui/IrisQuietCard";
import { IrisScreen } from "@/components/ui/IrisScreen";
import { authCopy } from "@/constants/auth-copy";
import {
  fetchPrivateLoginQuiz,
  verifyPrivateLoginQuiz
} from "@/services/private-login.service";
import { usePrivateAccessStore } from "@/stores/private-access.store";
import type {
  PrivateAccessSession,
  PrivateLoginAnswerPayload,
  PrivateLoginQuizQuestion
} from "@/types/private-login.types";
import { cn } from "@/utils/cn";
import { normalizePrivateSuccessRoute } from "@/utils/routes";

function getFailureMessage(reason: string | undefined): string {
  if (reason === "too_many_attempts") {
    return authCopy.quizRateLimit;
  }

  if (reason === "unauthenticated") {
    return authCopy.anonymousMissing;
  }

  return authCopy.quizFailure;
}

function buildAccessSession(input: {
  slug: string;
  resultProfile: NonNullable<Awaited<ReturnType<typeof verifyPrivateLoginQuiz>>["profile"]>;
  sessionId: string;
  successRoute: string;
}): PrivateAccessSession {
  return {
    session_id: input.sessionId,
    target_id: input.resultProfile.target_id,
    slug: input.resultProfile.slug ?? input.slug,
    label: input.resultProfile.label,
    name: input.resultProfile.name,
    full_name: input.resultProfile.full_name,
    nickname: input.resultProfile.nickname,
    email: input.resultProfile.email,
    avatar_url: input.resultProfile.avatar_url,
    success_route: input.successRoute,
    profile_payload: input.resultProfile.profile_payload ?? {},
    granted_at: new Date().toISOString(),
    expires_at: null
  };
}

function QuizOption({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={cn(
        "min-h-[64px] justify-center rounded-2xl border px-4 py-4",
        selected
          ? "border-foreground bg-foreground"
          : "border-border bg-surface"
      )}
    >
      <Text
        className={cn(
          "text-[15px] leading-6",
          selected ? "font-semibold text-white" : "text-foreground"
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function QuestionStep({
  question,
  selectedOptionId,
  onSelect
}: {
  question: PrivateLoginQuizQuestion;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string) => void;
}) {
  return (
    <View>
      <Text className="text-[31px] leading-[37px] tracking-[-1.2px] text-foreground">
        {question.prompt}
      </Text>

      {question.helper_text ? (
        <Text className="mt-4 text-body leading-7 text-foreground-muted">
          {question.helper_text}
        </Text>
      ) : null}

      <View className="mt-8 gap-3">
        {question.options.map((option) => (
          <QuizOption
            key={option.id}
            label={option.label}
            selected={selectedOptionId === option.id}
            onPress={() => onSelect(option.id)}
          />
        ))}
      </View>
    </View>
  );
}

export default function PrivateLoginQuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const setActiveAccess = usePrivateAccessStore((state) => state.setActiveAccess);

  const slug = Array.isArray(params.slug)
    ? params.slug[0] ?? "isabela"
    : params.slug ?? "isabela";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["private-login-quiz", slug],
    queryFn: () => fetchPrivateLoginQuiz(slug),
    enabled: slug.length > 0
  });

  const questions = query.data?.questions ?? [];
  const target = query.data?.target ?? null;
  const currentQuestion = questions[currentIndex];

  const selectedCount = useMemo(
    () => questions.filter((question) => Boolean(selectedAnswers[question.id])).length,
    [questions, selectedAnswers]
  );

  const progressLabel = questions.length
    ? `${selectedCount}/${questions.length}`
    : "0/3";

  const progressWidth = questions.length
    ? `${Math.max(8, (selectedCount / questions.length) * 100)}%`
    : "8%";

  const mutation = useMutation({
    mutationFn: (answers: PrivateLoginAnswerPayload[]) =>
      verifyPrivateLoginQuiz({
        targetSlug: slug,
        answers
      }),
    onSuccess: (result) => {
      if (!result.granted || !result.profile || !result.session_id) {
        setFailureMessage(getFailureMessage(result.reason));
        return;
      }

      const successRoute = result.success_route ?? "/home";

      setActiveAccess(
        buildAccessSession({
          slug,
          resultProfile: result.profile,
          sessionId: result.session_id,
          successRoute
        })
      );

      router.replace(normalizePrivateSuccessRoute(successRoute));
    },
    onError: () => {
      setFailureMessage(authCopy.quizFailure);
    }
  });

  const selectedCurrentOption = currentQuestion
    ? selectedAnswers[currentQuestion.id]
    : undefined;

  const canContinue = Boolean(selectedCurrentOption) && !mutation.isPending;

  function handleSelect(optionId: string) {
    if (!currentQuestion) return;

    setFailureMessage(null);
    setSelectedAnswers((current) => ({
      ...current,
      [currentQuestion.id]: optionId
    }));
  }

  function buildPayload(): PrivateLoginAnswerPayload[] {
    return questions.flatMap((question) => {
      const optionId = selectedAnswers[question.id];

      if (!optionId) return [];

      return [
        {
          question_id: question.id,
          option_id: optionId
        }
      ];
    });
  }

  function handleContinue() {
    if (!currentQuestion || !canContinue) return;

    const isLast = currentIndex >= questions.length - 1;

    if (!isLast) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    mutation.mutate(buildPayload());
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
      return;
    }

    router.back();
  }

  if (query.isLoading) {
    return (
      <IrisScreen scroll={false}>
        <View className="flex-1 justify-center">
          <Text className="text-[34px] leading-[40px] tracking-[-1.2px] text-foreground">
            A IRIS está preparando as perguntas.
          </Text>

          <View className="mt-10 gap-3">
            <View className="h-16 rounded-2xl border border-border bg-surface opacity-60" />
            <View className="h-16 rounded-2xl border border-border bg-surface opacity-40" />
            <View className="h-16 rounded-2xl border border-border bg-surface opacity-30" />
          </View>
        </View>
      </IrisScreen>
    );
  }

  if (query.error || !target || !currentQuestion) {
    return (
      <IrisScreen>
        <View className="min-h-full justify-center">
          <IrisQuietCard>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-foreground">
              <Lock size={18} color="#FFFFFF" />
            </View>

            <Text className="mt-6 text-[30px] leading-[36px] tracking-[-1.1px] text-foreground">
              Não consegui abrir esse caminho.
            </Text>

            <Text className="mt-4 text-body leading-7 text-foreground-muted">
              Verifique se o quiz da Isabela está ativo no banco e se existem
              exatamente 3 perguntas com 3 alternativas cada.
            </Text>

            <IrisButton
              className="mt-8"
              label="Voltar"
              variant="secondary"
              onPress={() => router.back()}
            />
          </IrisQuietCard>
        </View>
      </IrisScreen>
    );
  }

  return (
    <IrisScreen scroll={false}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full bg-transparent"
          >
            <ChevronLeft size={23} color="#111111" />
          </Pressable>

          <Text className="text-detail font-semibold text-foreground-muted">
            {progressLabel} concluído
          </Text>
        </View>

        <View className="mt-5 h-[3px] overflow-hidden rounded-full bg-border">
          <View
            className="h-full rounded-full bg-foreground"
            style={{ width: progressWidth }}
          />
        </View>

        <View className="mt-10">
          <View className="mb-7 flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full border border-border bg-surface">
              {currentIndex === 0 ? (
                <Sparkles size={16} color="#111111" />
              ) : (
                <Heart size={16} color="#111111" />
              )}
            </View>

            <Text className="flex-1 text-caption text-foreground-muted">
              {currentIndex === 0
                ? authCopy.quizIntroTitle
                : "Cada resposta aproxima você do espaço."}
            </Text>
          </View>

          <QuestionStep
            question={currentQuestion}
            selectedOptionId={selectedCurrentOption}
            onSelect={handleSelect}
          />
        </View>

        {failureMessage ? (
          <IrisQuietCard className="mt-6 border-danger/40">
            <Text className="text-caption leading-5 text-foreground">
              {failureMessage}
            </Text>
          </IrisQuietCard>
        ) : null}

        <View className="mt-auto pt-6">
          <IrisButton
            label={
              currentIndex >= questions.length - 1
                ? "Abrir nosso espaço"
                : "Continuar"
            }
            disabled={!canContinue}
            loading={mutation.isPending}
            onPress={handleContinue}
          />

          <Text className="mt-5 text-center text-detail text-foreground-muted">
            As respostas ficam protegidas. O app não recebe o gabarito.
          </Text>
        </View>
      </View>
    </IrisScreen>
  );
}
EOF

cat > "mobile/app/(tabs)/_layout.tsx" <<'EOF'
// mobile/app/(tabs)/_layout.tsx
import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: {
          backgroundColor: "#FAF7F2"
        }
      }}
    />
  );
}
EOF

cat > "mobile/app/(tabs)/home.tsx" <<'EOF'
// mobile/app/(tabs)/home.tsx
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Heart, Lock, Sparkles } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { IrisButton } from "@/components/ui/IrisButton";
import { IrisQuietCard } from "@/components/ui/IrisQuietCard";
import { IrisScreen } from "@/components/ui/IrisScreen";
import { getMyPrivateAccess } from "@/services/private-login.service";
import { usePrivateAccessStore } from "@/stores/private-access.store";

export default function HomeScreen() {
  const activeAccess = usePrivateAccessStore((state) => state.activeAccess);
  const setActiveAccess = usePrivateAccessStore((state) => state.setActiveAccess);

  const query = useQuery({
    queryKey: ["my-private-access"],
    queryFn: getMyPrivateAccess,
    enabled: !activeAccess
  });

  useEffect(() => {
    const firstSession = query.data?.sessions[0];

    if (firstSession) {
      setActiveAccess(firstSession);
    }
  }, [query.data?.sessions, setActiveAccess]);

  const access = activeAccess ?? query.data?.sessions[0] ?? null;
  const name = access?.nickname ?? access?.full_name ?? access?.name ?? "Isa";

  return (
    <IrisScreen>
      <View className="min-h-full justify-between">
        <View>
          <View className="mt-4 flex-row items-center justify-between">
            <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface">
              <Sparkles size={17} color="#111111" />
            </View>

            <View className="rounded-full border border-border bg-surface px-4 py-2">
              <Text className="text-detail font-semibold text-foreground-muted">
                espaço privado
              </Text>
            </View>
          </View>

          <Text className="mt-14 text-[39px] leading-[45px] tracking-[-1.5px] text-foreground">
            Bem-vinda,{"\n"}
            {name}.
          </Text>

          <Text className="mt-5 max-w-[320px] text-body leading-7 text-foreground-muted">
            A porta abriu. A partir daqui, o IRIS vai guardar memórias,
            cartas, lugares, sonhos e pequenos sinais da nossa história.
          </Text>

          <IrisQuietCard className="mt-10">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-foreground">
                <Heart size={17} color="#FFFFFF" />
              </View>

              <View className="flex-1">
                <Text className="text-caption font-semibold text-foreground">
                  Primeiro acesso confirmado
                </Text>
                <Text className="mt-1 text-detail leading-5 text-foreground-muted">
                  Este aparelho recebeu uma sessão privada pelo quiz.
                </Text>
              </View>
            </View>
          </IrisQuietCard>

          <View className="mt-5 flex-row gap-3">
            <View className="flex-1 rounded-3xl border border-border bg-surface px-4 py-5">
              <Text className="text-detail text-foreground-muted">módulo</Text>
              <Text className="mt-2 text-[19px] font-semibold text-foreground">
                Memórias
              </Text>
            </View>

            <View className="flex-1 rounded-3xl border border-border bg-surface px-4 py-5">
              <Text className="text-detail text-foreground-muted">módulo</Text>
              <Text className="mt-2 text-[19px] font-semibold text-foreground">
                Cartas
              </Text>
            </View>
          </View>

          <View className="mt-3 rounded-3xl border border-border bg-surface px-5 py-6">
            <Text className="text-detail text-foreground-muted">próximo passo</Text>
            <Text className="mt-2 text-[23px] leading-[29px] tracking-[-0.6px] text-foreground">
              Construir o espaço inicial do casal: linha do tempo, primeira
              carta e capa emocional.
            </Text>
          </View>
        </View>

        <View className="mt-10">
          {!access && !query.isLoading ? (
            <IrisQuietCard className="mb-5">
              <View className="flex-row items-center gap-3">
                <Lock size={17} color="#111111" />
                <Text className="flex-1 text-caption leading-5 text-foreground-muted">
                  Não encontrei sessão privada ativa neste aparelho.
                </Text>
              </View>
            </IrisQuietCard>
          ) : null}

          <IrisButton
            label={access ? "Continuar" : "Voltar para entrada"}
            onPress={() => {
              if (!access) {
                router.replace("/entry");
              }
            }}
          />
        </View>
      </View>
    </IrisScreen>
  );
}
EOF

cd mobile
npm run typecheck
