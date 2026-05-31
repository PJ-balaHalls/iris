    // setup-iris-mobile.cjs
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const cwd = process.cwd();

function exists(targetPath) {
  return fs.existsSync(targetPath);
}

function readJson(targetPath) {
  return JSON.parse(fs.readFileSync(targetPath, "utf8"));
}

function writeJson(targetPath, value) {
  fs.writeFileSync(targetPath, `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, options = {}) {
  console.log(`\n$ ${command}`);
  cp.execSync(command, {
    stdio: "inherit",
    shell: true,
    ...options
  });
}

function writeFileIfMissing(filePath, content) {
  if (exists(filePath)) {
    console.log(`↳ já existe: ${path.relative(process.cwd(), filePath)}`);
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✓ criado: ${path.relative(process.cwd(), filePath)}`);
}

function mkdirIfMissing(dirPath) {
  if (exists(dirPath)) {
    console.log(`↳ já existe: ${path.relative(process.cwd(), dirPath)}`);
    return;
  }

  fs.mkdirSync(dirPath, { recursive: true });
  console.log(`✓ criado: ${path.relative(process.cwd(), dirPath)}`);
}

function hasNextApp(targetDir) {
  const packagePath = path.join(targetDir, "package.json");
  const appDir = path.join(targetDir, "src", "app");

  if (!exists(packagePath)) return false;

  try {
    const pkg = readJson(packagePath);
    return Boolean(pkg.dependencies?.next || pkg.devDependencies?.next || exists(appDir));
  } catch {
    return false;
  }
}

function resolveRepoRoot() {
  const currentName = path.basename(cwd);

  if (currentName === "mobile") {
    return path.dirname(cwd);
  }

  if (currentName === "web" && hasNextApp(cwd)) {
    return path.dirname(cwd);
  }

  return cwd;
}

const repoRoot = resolveRepoRoot();
const mobileRoot = path.join(repoRoot, "mobile");
const webRoot = path.join(repoRoot, "web");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("IRÍS Mobile Bootstrap — Node Safe");
console.log("Expo + NativeWind + Supabase + Flags");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");
console.log(`Raiz detectada: ${repoRoot}`);
console.log(`Mobile:         ${mobileRoot}`);
console.log("");

if (exists(path.join(mobileRoot, "mobile"))) {
  console.error("Erro: detectei /mobile/mobile. Isso parece duplicação anterior.");
  console.error("Remova ou renomeie essa pasta antes de continuar.");
  process.exit(1);
}

if (!exists(path.join(repoRoot, "package.json")) && !exists(path.join(webRoot, "package.json"))) {
  console.error("Erro: não encontrei package.json na raiz nem em /web.");
  console.error("Abra o terminal na raiz do repositório IRÍS e rode novamente.");
  process.exit(1);
}

const mobilePackageJson = path.join(mobileRoot, "package.json");

if (!exists(mobilePackageJson)) {
  if (!exists(mobileRoot)) {
    console.log("Criando app Expo em /mobile...");
    run(`npx create-expo-app@latest "${mobileRoot}" --template blank-typescript`, {
      cwd: repoRoot
    });
  } else {
    const files = fs.readdirSync(mobileRoot);

    if (files.length === 0) {
      console.log("/mobile existe, mas está vazio. Criando app Expo...");
      fs.rmdirSync(mobileRoot);
      run(`npx create-expo-app@latest "${mobileRoot}" --template blank-typescript`, {
        cwd: repoRoot
      });
    } else {
      console.log("/mobile existe, mas não tem package.json. Vou completar sem apagar nada.");

      const tempDir = path.join(repoRoot, ".iris-mobile-template-temp");

      fs.rmSync(tempDir, { recursive: true, force: true });

      run(`npx create-expo-app@latest "${tempDir}" --template blank-typescript`, {
        cwd: repoRoot
      });

      for (const fileName of ["package.json", "tsconfig.json", "App.tsx", "app.json"]) {
        const from = path.join(tempDir, fileName);
        const to = path.join(mobileRoot, fileName);

        if (exists(from) && !exists(to)) {
          fs.copyFileSync(from, to);
          console.log(`✓ recuperado: mobile/${fileName}`);
        }
      }

      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
} else {
  console.log("↳ /mobile já possui package.json. Não vou recriar o app Expo.");
}

console.log("\nInstalando dependências Expo compatíveis...");
run(
  [
    "npx expo install",
    "expo-router",
    "react-native-safe-area-context",
    "react-native-screens",
    "expo-linking",
    "expo-constants",
    "expo-status-bar",
    "react-native-gesture-handler",
    "react-native-reanimated",
    "expo-secure-store",
    "expo-localization",
    "expo-haptics",
    "expo-image-picker",
    "expo-notifications",
    "expo-file-system",
    "expo-font",
    "@react-native-async-storage/async-storage",
    "react-native-url-polyfill",
    "react-native-svg",
    "react-native-maps"
  ].join(" "),
  { cwd: mobileRoot }
);

console.log("\nInstalando dependências de produto...");
run(
  [
    "npm install",
    "@supabase/supabase-js",
    "@tanstack/react-query",
    "zustand",
    "zod",
    "react-hook-form",
    "@hookform/resolvers",
    "nativewind",
    "tailwind-merge",
    "clsx",
    "class-variance-authority",
    "moti",
    "lucide-react-native"
  ].join(" "),
  { cwd: mobileRoot }
);

console.log("\nInstalando dependências dev...");
run(
  [
    "npm install -D",
    "tailwindcss@^3.4.17",
    "prettier-plugin-tailwindcss@^0.5.11",
    "babel-preset-expo",
    "dotenv"
  ].join(" "),
  { cwd: mobileRoot }
);

console.log("\nNormalizando package.json...");
const pkg = readJson(mobilePackageJson);

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

writeJson(mobilePackageJson, pkg);

const folders = [
  "app",
  "src/components/ui",
  "src/components/auth",
  "src/components/onboarding",
  "src/components/layout",
  "src/components/system",
  "src/config",
  "src/constants",
  "src/hooks",
  "src/lib",
  "src/schemas",
  "src/services",
  "src/stores",
  "src/types",
  "src/utils"
];

for (const folder of folders) {
  mkdirIfMissing(path.join(mobileRoot, folder));
}

writeFileIfMissing(
  path.join(mobileRoot, "global.css"),
  `@tailwind base;
@tailwind components;
@tailwind utilities;
`
);

writeFileIfMissing(
  path.join(mobileRoot, "nativewind-env.d.ts"),
  `/// <reference types="nativewind/types" />
`
);

writeFileIfMissing(
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

writeFileIfMissing(
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

writeFileIfMissing(
  path.join(mobileRoot, "tailwind.config.js"),
  `// mobile/tailwind.config.js
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
`
);

writeFileIfMissing(
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
  ]
}
`
);

writeFileIfMissing(
  path.join(mobileRoot, "app.config.ts"),
  `// mobile/app.config.ts
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
`
);

writeFileIfMissing(
  path.join(mobileRoot, ".env.example"),
  `# mobile/.env.example

EXPO_PUBLIC_IRIS_ENV=development
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Compatibilidade se você colar o .env do web:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# NUNCA colocar no mobile:
# SUPABASE_SERVICE_ROLE_KEY=
`
);

const gitignorePath = path.join(mobileRoot, ".gitignore");

if (!exists(gitignorePath)) {
  fs.writeFileSync(gitignorePath, "");
}

const gitignore = fs.readFileSync(gitignorePath, "utf8");

const requiredGitignoreLines = [".env", ".env.*", "!.env.example"];

for (const line of requiredGitignoreLines) {
  if (!gitignore.split(/\r?\n/).includes(line)) {
    fs.appendFileSync(gitignorePath, `${line}\n`);
  }
}

writeFileIfMissing(
  path.join(mobileRoot, "src/constants/tokens.ts"),
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

export const irisRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 999
} as const;
`
);

writeFileIfMissing(
  path.join(mobileRoot, "src/config/feature-flags.ts"),
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

writeFileIfMissing(
  path.join(mobileRoot, "src/lib/feature-flags.ts"),
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

writeFileIfMissing(
  path.join(mobileRoot, "src/config/env.ts"),
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

writeFileIfMissing(
  path.join(mobileRoot, "src/lib/query-client.ts"),
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

writeFileIfMissing(
  path.join(mobileRoot, "src/lib/supabase.ts"),
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

writeFileIfMissing(
  path.join(mobileRoot, "app/_layout.tsx"),
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

writeFileIfMissing(
  path.join(mobileRoot, "app/index.tsx"),
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

const appTsx = path.join(mobileRoot, "App.tsx");
const appLegacy = path.join(mobileRoot, "App.legacy.tsx");

if (exists(appTsx) && !exists(appLegacy)) {
  fs.renameSync(appTsx, appLegacy);
  console.log("✓ App.tsx movido para App.legacy.tsx");
}

console.log("\nRodando typecheck...");
try {
  run("npm run typecheck", { cwd: mobileRoot });
} catch {
  console.log("");
  console.log("⚠️ O setup terminou, mas o typecheck falhou.");
  console.log("Isso normalmente é ajuste fino de dependência/tipo.");
  console.log("Me mande o erro completo do typecheck se aparecer.");
}

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("IRÍS Mobile preparado sem duplicar.");
console.log("");
console.log("Próximos comandos:");
console.log("cd mobile");
console.log("copy .env.example .env");
console.log("npm run start");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");