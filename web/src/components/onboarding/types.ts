// web/src/components/onboarding/types.ts
import type { UseFormReturn } from "react-hook-form";
import type { OnboardingFormValues } from "@/schemas/onboarding.schema";

export type UsernameStatus =
  | { state: "idle"; message: string }
  | { state: "checking"; message: string }
  | { state: "available"; message: string }
  | { state: "unavailable"; message: string }
  | { state: "unknown"; message: string };

export type OnboardingStepProps = {
  form: UseFormReturn<OnboardingFormValues>;
  usernameStatus: UsernameStatus;
  setUsernameStatus: React.Dispatch<React.SetStateAction<UsernameStatus>>;
};
