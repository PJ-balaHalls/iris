#!/usr/bin/env bash
set -Eeuo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "IRÍS Mobile Bootstrap — Root Safe"
echo "Expo + NativeWind + Supabase + Flags"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROOT_DIR="$(pwd)"
MOBILE_DIR="$ROOT_DIR/mobile"
WEB_DIR="$ROOT_DIR/web"

die() {
  echo ""
  echo "Erro: $1"
  exit 1
}

info() {
  echo "• $1"
}

skip() {
  echo "↳ já existe: $1"
}

create_dir() {
  if [ -d "$1" ]; then
    skip "$1"
  else
    mkdir -p "$1"
    info "criado: $1"
  fi
}

write_file_if_missing() {
  local path="$1"
  local content="$2"

  if [ -f "$path" ]; then
    skip "$path"
    return 0
  fi

  mkdir -p "$(dirname "$path")"
  printf "%s" "$content" > "$path"
  info "criado: $path"
}

# ────────────────────────────────────────
# 1. Validação da raiz
# ────────────────────────────────────────

if [ "$(basename "$ROOT_DIR")" = "web" ]; then
  die "você está dentro de /web. Rode este script na raiz do repositório IRÍS."
fi

if [ -d "$ROOT_DIR/mobile/mobile" ]; then
  die "detectei mobile/mobile. Isso parece duplicação anterior. Corrija antes de continuar."
fi

if [ ! -f "$ROOT_DIR/package.json" ] && [ ! -f "$WEB_DIR/package.json" ]; then
  die "não encontrei package.json na raiz nem em /web. Rode na raiz correta do projeto."
fi

if [ -f "$ROOT_DIR/package.json" ] && grep -q '"next"' "$ROOT_DIR/package.json" && [ -d "$ROOT_DIR/src/app" ]; then
  info "repositório parece estar em modo web na raiz. Mobile será criado em: $MOBILE_DIR"
elif [ -f "$WEB_DIR/package.json" ]; then
  info "monorepo detectado com /web. Mobile será criado em: $MOBILE_DIR"
else
  info "estrutura raiz aceita. Mobile será criado em: $MOBILE_DIR"
fi

# ────────────────────────────────────────
# 2. Criar /mobile sem duplicar
# ────────────────────────────────────────

if [ -f "$MOBILE_DIR/package.json" ]; then
  info "/mobile já possui package.json. Não vou recriar o app Expo."
else
  if [ ! -d "$MOBILE_DIR" ]; then
    info "criando app Expo em /mobile..."
    npx create-expo-app@latest "$MOBILE_DIR" --template blank-typescript
  else
    if [ -z "$(ls -A "$MOBILE_DIR")" ]; then
      info "/mobile existe mas está vazio. Criando app Expo..."
      rmdir "$MOBILE_DIR"
      npx create-expo-app@latest "$MOBILE_DIR" --template blank-typescript
    else
      info "/mobile existe, mas não tem package.json. Vou completar sem apagar nada."
      TEMP_DIR="$ROOT_DIR/.iris-mobile-template-temp"

      rm -rf "$TEMP_DIR"
      npx create-expo-app@latest "$TEMP_DIR" --template blank-typescript

      cp -n "$TEMP_DIR/package.json" "$MOBILE_DIR/package.json"
      cp -n "$TEMP_DIR/tsconfig.json" "$MOBILE_DIR/tsconfig.json" 2>/dev/null || true
      cp -n "$TEMP_DIR/App.tsx" "$MOBILE_DIR/App.tsx" 2>/dev/null || true
      cp -n "$TEMP_DIR/app.json" "$MOBILE_DIR/app.json" 2>/dev/null || true

      rm -rf "$TEMP_DIR"
    fi
  fi
fi

cd "$MOBILE_DIR"

# ────────────────────────────────────────
# 3. Dependências — npm é idempotente
# ────────────────────────────────────────

info "instalando dependências Expo compatíveis..."
npx expo install \
  expo-router \
  react-native-safe-area-context \
  react-native-screens \
  expo-linking \
  expo-constants \
  expo-status-bar \
  react-native-gesture-handler \
  react-native-reanimated \
  expo-secure-store \
  expo-localization \
  expo-haptics \
  expo-image-picker \
  expo-notifications \
  expo-file-system \
  expo-font \
  @react-native-async-storage/async-storage \
  react-native-url-polyfill \
  react-native-svg \
  react-native-maps

info "instalando dependências de produto..."
npm install \
  @supabase/supabase-js \
  @tanstack/react-query \
  zustand \
  zod \
  react-hook-form \
  @hookform/resolvers \
  nativewind \
  tailwind-merge \
  clsx \
  class-variance-authority \
  moti \
  lucide-react-native

info "instalando dependências dev..."
npm install -D \
  tailwindcss@^3.4.17 \
  prettier-plugin-tailwindcss@^0.5.11 \
  babel-preset-expo \
  dotenv

# ────────────────────────────────────────
# 4. Ajustar package.json sem duplicar scripts
# ────────────────────────────────────────

info "normalizando package.json..."
node <<'NODE'
const fs = require("node:fs");

const path = "package.json";
const pkg = JSON.parse(fs.readFileSync(path, "utf8"));

pkg.name = pkg.name && pkg.name !== "mobile" ? pkg.name : "@iris/mobile";
pkg.private = true;
pkg.main = "expo-router/entry";

pkg.scripts = {
  ...(pkg.scripts ?? {}),
  start: "expo start --clear",
  android: "expo run:android",
  ios: "expo run:ios",
  web: "expo start --web --clear",
  typecheck: "tsc --noEmit"
};

fs.writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
NODE

# ────────────────────────────────────────
# 5. Pastas base
# ────────────────────────────────────────

create_dir "$MOBILE_DIR/app"
create_dir "$MOBILE_DIR/src/components/ui"
create_dir "$MOBILE_DIR/src/components/auth"
create_dir "$MOBILE_DIR/src/components/onboarding"
create_dir "$MOBILE_DIR/src/components/layout"
create_dir "$MOBILE_DIR/src/components/system"
create_dir "$MOBILE_DIR/src/config"
create_dir "$MOBILE_DIR/src/constants"
create_dir "$MOBILE_DIR/src/hooks"
create_dir "$MOBILE_DIR/src/lib"
create_dir "$MOBILE_DIR/src/schemas"
create_dir "$MOBILE_DIR/src/services"
create_dir "$MOBILE_DIR/src/stores"
create_dir "$MOBILE_DIR/src/types"
create_dir "$MOBILE_DIR/src/utils"

# ────────────────────────────────────────
# 6. Configurações globais
# ────────────────────────────────────────

write_file_if_missing "$MOBILE_DIR/global.css" '@tailwind base;
@tailwind components;
@tailwind utilities;
'

write_file_if_missing "$MOBILE_DIR/nativewind-env.d.ts" '/// <reference types="nativewind/types" />
'

write_file_if_missing "$MOBILE_DIR/metro.config.js" '// mobile/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css"
});
'

write_file_if_missing "$MOBILE_DIR/babel.config.js" '// mobile/babel.config.js
module.exports = function babelConfig(api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ],
    plugins: ["react-native-reanimated/plugin"]
  };
};
'

write_file_if_missing "$MOBILE_DIR/tailwind.config.js" '// mobile/tailwind.config.js
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FAF7F2",
        surface: "#FFFFFF",
        foreground: "#111111",
        "foreground-secondary": "#444444",
        "foreground-muted": "#666666",
        border: "#E0DDD6",
        accent: "#006D4E",
        "accent-subtle": "#183A2E",
        emotion: "#9A7CA7",
        focus: "#006D4E",
        danger: "#B42318",
        success: "#006D4E",
        black: "#111111",
        white: "#FFFFFF"
      },
      fontSize: {
        detail: ["12px", { lineHeight: "16px" }],
        caption: ["14px", { lineHeight: "20px" }],
        body: ["16px", { lineHeight: "24px" }],
        lead: ["18px", { lineHeight: "27px" }],
        h3: ["24px", { lineHeight: "31px" }],
        h2: ["32px", { lineHeight: "40px" }],
        h1: ["40px", { lineHeight: "48px" }]
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
        full: "999px"
      },
      boxShadow: {
        irisSm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        irisMd: "0 4px 8px rgba(0, 0, 0, 0.08)",
        irisLg: "0 10px 20px rgba(0, 0, 0, 0.10)"
      }
    }
  },
  plugins: []
};
'

write_file_if_missing "$MOBILE_DIR/tsconfig.json" '{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["nativewind/types"]
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
'

write_file_if_missing "$MOBILE_DIR/app.config.ts" '// mobile/app.config.ts
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
'

write_file_if_missing "$MOBILE_DIR/.env.example" '# mobile/.env.example

EXPO_PUBLIC_IRIS_ENV=development
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Compatibilidade se você colar o .env do web:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# NUNCA colocar no mobile:
# SUPABASE_SERVICE_ROLE_KEY=
'

# ────────────────────────────────────────
# 7. .gitignore sem duplicar linhas
# ────────────────────────────────────────

touch "$MOBILE_DIR/.gitignore"

grep -qxF ".env" "$MOBILE_DIR/.gitignore" || echo ".env" >> "$MOBILE_DIR/.gitignore"
grep -qxF ".env.*" "$MOBILE_DIR/.gitignore" || echo ".env.*" >> "$MOBILE_DIR/.gitignore"
grep -qxF "!.env.example" "$MOBILE_DIR/.gitignore" || echo "!.env.example" >> "$MOBILE_DIR/.gitignore"

# ────────────────────────────────────────
# 8. Arquivos base de domínio
# ────────────────────────────────────────

write_file_if_missing "$MOBILE_DIR/src/constants/tokens.ts" '// mobile/src/constants/tokens.ts
export const irisColors = {
  background: "#FAF7F2",
  surface: "#FFFFFF",
  foreground: "#111111",
  foregroundSecondary: "#444444",
  foregroundMuted: "#666666",
  border: "#E0DDD6",
  accent: "#006D4E",
  accentSubtle: "#183A2E",
  emotion: "#9A7CA7",
  danger: "#B42318",
  success: "#006D4E"
} as const;

export const irisRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 999
} as const;
'

write_file_if_missing "$MOBILE_DIR/src/config/feature-flags.ts" '// mobile/src/config/feature-flags.ts
export const irisFeatureFlagDefinitions = [
  {
    key: "mobile.private_test.enabled",
    defaultEnabled: true,
    adminGroup: "mobile",
    description: "Libera o app mobile para o teste privado inicial."
  },
  {
    key: "mobile.public_app.enabled",
    defaultEnabled: false,
    adminGroup: "mobile",
    description: "Libera comportamento de app público/global."
  },
  {
    key: "auth.login.enabled",
    defaultEnabled: true,
    adminGroup: "auth",
    description: "Libera fluxo de login mobile."
  },
  {
    key: "onboarding.cognitive.enabled",
    defaultEnabled: true,
    adminGroup: "onboarding",
    description: "Libera onboarding cognitivo do IRIS."
  },
  {
    key: "memories.enabled",
    defaultEnabled: false,
    adminGroup: "memories",
    description: "Libera módulo de memórias."
  },
  {
    key: "aurora.enabled",
    defaultEnabled: false,
    adminGroup: "ai",
    description: "Libera Aurora no mobile."
  },
  {
    key: "universe.alive.enabled",
    defaultEnabled: false,
    adminGroup: "universe",
    description: "Libera Universo Vivo."
  }
] as const;

export type IrisFeatureFlagKey =
  (typeof irisFeatureFlagDefinitions)[number]["key"];

export type IrisFeatureFlagState = Record<IrisFeatureFlagKey, boolean>;

export const defaultFeatureFlags = Object.fromEntries(
  irisFeatureFlagDefinitions.map((flag) => [flag.key, flag.defaultEnabled])
) as IrisFeatureFlagState;
'

write_file_if_missing "$MOBILE_DIR/src/lib/feature-flags.ts" '// mobile/src/lib/feature-flags.ts
import {
  defaultFeatureFlags,
  type IrisFeatureFlagKey,
  type IrisFeatureFlagState
} from "@/config/feature-flags";

export function isFeatureEnabled(
  key: IrisFeatureFlagKey,
  overrides: Partial<IrisFeatureFlagState> = {}
): boolean {
  return overrides[key] ?? defaultFeatureFlags[key] ?? false;
}

export function mergeFeatureFlags(
  remoteFlags: Partial<IrisFeatureFlagState> | null | undefined
): IrisFeatureFlagState {
  return {
    ...defaultFeatureFlags,
    ...(remoteFlags ?? {})
  };
}
'

write_file_if_missing "$MOBILE_DIR/src/config/env.ts" '// mobile/src/config/env.ts
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
'

write_file_if_missing "$MOBILE_DIR/src/lib/query-client.ts" '// mobile/src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 0
    }
  }
});
'

write_file_if_missing "$MOBILE_DIR/src/lib/supabase.ts" '// mobile/src/lib/supabase.ts
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
'

write_file_if_missing "$MOBILE_DIR/app/_layout.tsx" '// mobile/app/_layout.tsx
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
'

write_file_if_missing "$MOBILE_DIR/app/index.tsx" '// mobile/app/index.tsx
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
'

# ────────────────────────────────────────
# 9. App.tsx legado
# ────────────────────────────────────────

if [ -f "$MOBILE_DIR/App.tsx" ] && [ ! -f "$MOBILE_DIR/App.legacy.tsx" ]; then
  mv "$MOBILE_DIR/App.tsx" "$MOBILE_DIR/App.legacy.tsx"
  info "App.tsx movido para App.legacy.tsx porque Expo Router usa /app"
elif [ -f "$MOBILE_DIR/App.tsx" ]; then
  skip "$MOBILE_DIR/App.tsx"
fi

# ────────────────────────────────────────
# 10. Typecheck
# ────────────────────────────────────────

info "rodando typecheck..."
npm run typecheck

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "IRÍS Mobile preparado sem duplicar."
echo ""
echo "Próximos comandos:"
echo "cd mobile"
echo "cp .env.example .env"
echo "npm run start"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"