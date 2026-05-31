// mobile/src/config/feature-flags.ts
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
