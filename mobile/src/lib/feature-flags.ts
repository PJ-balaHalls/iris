// mobile/src/lib/feature-flags.ts
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
