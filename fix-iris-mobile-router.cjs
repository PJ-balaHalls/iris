const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("IRÍS Mobile Router Fix — executando");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const cwd = process.cwd();
const repoRoot = path.basename(cwd).toLowerCase() === "mobile" ? path.dirname(cwd) : cwd;
const mobileRoot = path.join(repoRoot, "mobile");

console.log("CWD:", cwd);
console.log("Repo:", repoRoot);
console.log("Mobile:", mobileRoot);

if (!fs.existsSync(mobileRoot)) {
  console.error("Erro: pasta /mobile não encontrada.");
  process.exit(1);
}

const packagePath = path.join(mobileRoot, "package.json");

if (!fs.existsSync(packagePath)) {
  console.error("Erro: mobile/package.json não encontrado.");
  process.exit(1);
}

function run(command, cwdPath = mobileRoot) {
  console.log("");
  console.log("$", command);
  cp.execSync(command, {
    cwd: cwdPath,
    stdio: "inherit",
    shell: true
  });
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log("✓ escrito:", path.relative(repoRoot, filePath));
}

function exactChild(parent, childName) {
  if (!fs.existsSync(parent)) return null;

  const children = fs.readdirSync(parent);
  const found = children.find((item) => item === childName);

  return found ? path.join(parent, found) : null;
}

function archiveExact(childName) {
  const target = exactChild(mobileRoot, childName);

  if (!target) return;

  const legacyDir = path.join(mobileRoot, ".iris-legacy");
  fs.mkdirSync(legacyDir, { recursive: true });

  const destination = path.join(
    legacyDir,
    `${childName}.${Date.now()}.bak`
  );

  fs.renameSync(target, destination);

  console.log(
    "✓ arquivado:",
    path.relative(repoRoot, target),
    "→",
    path.relative(repoRoot, destination)
  );
}

// Remove resíduos do template antigo.
// O log anterior mostrou conflito entre index.ts importando ./App e app/index.tsx.
// Isso quebra o Expo Router no Windows por diferença de maiúscula/minúscula.
archiveExact("index.ts");
archiveExact("index.js");
archiveExact("App.tsx");
archiveExact("App.jsx");
archiveExact("App.js");
archiveExact("App.legacy.tsx");

// Se existir uma pasta App maiúscula separada, arquiva.
// Mantém a pasta correta: mobile/app
const upperApp = exactChild(mobileRoot, "App");
if (upperApp) {
  const legacyDir = path.join(mobileRoot, ".iris-legacy");
  fs.mkdirSync(legacyDir, { recursive: true });

  const destination = path.join(legacyDir, `App.${Date.now()}.bak`);
  fs.renameSync(upperApp, destination);

  console.log(
    "✓ arquivada pasta App maiúscula:",
    path.relative(repoRoot, destination)
  );
}

fs.mkdirSync(path.join(mobileRoot, "app"), { recursive: true });
fs.mkdirSync(path.join(mobileRoot, "src", "config"), { recursive: true });
fs.mkdirSync(path.join(mobileRoot, "src", "lib"), { recursive: true });
fs.mkdirSync(path.join(mobileRoot, "src", "constants"), { recursive: true });

// package.json
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

pkg.name = pkg.name || "@iris/mobile";
pkg.private = true;
pkg.main = "expo-router/entry";
pkg.scripts = {
  ...(pkg.scripts || {}),
  start: "expo start --clear",
  android: "expo run:android",
  ios: "expo run:ios",
  web: "expo start --web --clear",
  typecheck: "tsc --noEmit"
};

fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log("✓ package.json corrigido");

// tsconfig com alias @/*
write(
  path.join(mobileRoot, "tsconfig.json"),
  `{
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
  ],
  "exclude": [
    "node_modules",
    ".iris-legacy"
  ]
}
`
);

// Babel
write(
  path.join(mobileRoot, "babel.config.js"),
  `// mobile/babel.config.js
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
`
);

// Metro
write(
  path.join(mobileRoot, "metro.config.js"),
  `// mobile/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css"
});
`
);

write(
  path.join(mobileRoot, "global.css"),
  `@tailwind base;
@tailwind components;
@tailwind utilities;
`
);

write(
  path.join(mobileRoot, "nativewind-env.d.ts"),
  `/// <reference types="nativewind/types" />
`
);

write(
  path.join(mobileRoot, "src", "constants", "tokens.ts"),
  `// mobile/src/constants/tokens.ts
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
`
);

write(
  path.join(mobileRoot, "src", "config", "feature-flags.ts"),
  `// mobile/src/config/feature-flags.ts
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
`
);

write(
  path.join(mobileRoot, "src", "lib", "feature-flags.ts"),
  `// mobile/src/lib/feature-flags.ts
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
`
);

write(
  path.join(mobileRoot, "src", "config", "env.ts"),
  `// mobile/src/config/env.ts
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
`
);

write(
  path.join(mobileRoot, "src", "lib", "query-client.ts"),
  `// mobile/src/lib/query-client.ts
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
`
);

write(
  path.join(mobileRoot, "src", "lib", "supabase.ts"),
  `// mobile/src/lib/supabase.ts
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
`
);

write(
  path.join(mobileRoot, "app", "_layout.tsx"),
  `// mobile/app/_layout.tsx
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
`
);

write(
  path.join(mobileRoot, "app", "index.tsx"),
  `// mobile/app/index.tsx
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
`
);

// Limpa caches.
const caches = [
  path.join(mobileRoot, ".expo"),
  path.join(mobileRoot, ".metro"),
  path.join(mobileRoot, "node_modules", ".cache")
];

for (const cachePath of caches) {
  if (fs.existsSync(cachePath)) {
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log("✓ cache removido:", path.relative(repoRoot, cachePath));
  }
}

try {
  run("npm run typecheck");
  console.log("");
  console.log("✓ Typecheck passou.");
} catch (error) {
  console.log("");
  console.log("⚠️ Typecheck ainda falhou. Copie o erro completo e me mande.");
}

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("Correção finalizada.");
console.log("Agora rode:");
console.log("cd mobile");
console.log("npx expo start --clear");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
