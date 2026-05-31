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
  console.warn("[IRIS_OFFICIAL_ONBOARDING_" + scope + "]", { message });
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
}): Promise<{ emailConfirmationRequired: boolean }> {
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
