// web/src/lib/botanic/server.ts
import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingServerPayload } from "@/schemas/onboarding.schema";

type ResolveInitialBotanicIdentityParams = {
  supabase: SupabaseClient;
  payload: OnboardingServerPayload;
  userId: string;
  email: string;
};

type InternalCreationKeyRow = {
  id: string;
  allowed_species_code: string;
  allowed_stage_code: string;
  allowed_inclination_code: string | null;
  allowed_governance_role_code: string | null;
  allowed_email_domain: string | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
};

type ResolvedIdentity = {
  speciesCode: string;
  stageCode: string;
  inclinationCode: string;
  governanceRoleCode: string | null;
  rootGovernanceEnabled: boolean;
  assignmentSource: string;
  assignedReason: string;
  metadata: Record<string, unknown>;
};

type ResolveInitialBotanicIdentityResult =
  | {
      ok: true;
      identity: ResolvedIdentity;
      internalCreationKeyId: string | null;
      nextInternalCreationKeyUsage: number | null;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

function hashInternalCreationKey(value: string) {
  return crypto.createHash("sha256").update(value.trim()).digest("hex");
}

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

function getDefaultExternalIdentity(payload: OnboardingServerPayload): ResolvedIdentity {
  if (payload.externalAccountType === "final_customer") {
    return {
      speciesCode: "LOTUS",
      stageCode: "BROTO",
      inclinationCode: payload.botanicInclination || "NULO",
      governanceRoleCode: null,
      rootGovernanceEnabled: false,
      assignmentSource: "onboarding_personal_user",
      assignedReason: "Conta comum do ecossistema criada sem vínculo institucional.",
      metadata: {
        externalAccountType: payload.externalAccountType,
      },
    };
  }

  return {
    speciesCode: "ORQUIDEA",
    stageCode: "BROTO",
    inclinationCode: payload.botanicInclination || "NULO",
    governanceRoleCode: null,
    rootGovernanceEnabled: false,
    assignmentSource: "onboarding_institutional_external",
    assignedReason: "Conta externa institucional inicial.",
    metadata: {
      externalAccountType: payload.externalAccountType,
      organizationFlow: payload.organizationFlow,
      organizationRelation: payload.organizationRelation,
    },
  };
}

function getDefaultInternalIdentity(payload: OnboardingServerPayload): ResolvedIdentity {
  return {
    speciesCode: "TULIPA",
    stageCode: "BROTO",
    inclinationCode: payload.botanicInclination || "NULO",
    governanceRoleCode: payload.internalRole === "dev" ? "staff_engineering" : "staff_curator",
    rootGovernanceEnabled: false,
    assignmentSource: "onboarding_internal_without_creation_key",
    assignedReason: "Conta interna criada sem chave de criação elevada.",
    metadata: {
      internalRole: payload.internalRole,
      internalTeam: payload.internalTeam,
    },
  };
}

async function getInternalCreationKey(
  supabase: SupabaseClient,
  keyValue: string,
): Promise<InternalCreationKeyRow | null> {
  const keyHash = hashInternalCreationKey(keyValue);

  const { data, error } = await supabase
    .from("botanic_internal_creation_keys")
    .select(
      [
        "id",
        "allowed_species_code",
        "allowed_stage_code",
        "allowed_inclination_code",
        "allowed_governance_role_code",
        "allowed_email_domain",
        "max_uses",
        "used_count",
        "expires_at",
        "is_active",
        "metadata",
      ].join(","),
    )
    .eq("key_hash", keyHash)
    .maybeSingle<InternalCreationKeyRow>();

  if (error || !data) {
    return null;
  }

  return data;
}

function isCreationKeyUsable(params: {
  row: InternalCreationKeyRow;
  email: string;
}) {
  const { row, email } = params;

  if (!row.is_active) return false;

  if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return false;
  }

  if (row.max_uses !== null && row.used_count >= row.max_uses) {
    return false;
  }

  if (row.allowed_email_domain) {
    return getEmailDomain(email) === row.allowed_email_domain;
  }

  return true;
}

export async function resolveInitialBotanicIdentity(
  params: ResolveInitialBotanicIdentityParams,
): Promise<ResolveInitialBotanicIdentityResult> {
  const { supabase, payload, email } = params;

  if (payload.accountScope === "external") {
    return {
      ok: true,
      identity: getDefaultExternalIdentity(payload),
      internalCreationKeyId: null,
      nextInternalCreationKeyUsage: null,
    };
  }

  if (!payload.hasInternalCreationKey || !payload.internalCreationKey?.trim()) {
    return {
      ok: true,
      identity: getDefaultInternalIdentity(payload),
      internalCreationKeyId: null,
      nextInternalCreationKeyUsage: null,
    };
  }

  const creationKey = await getInternalCreationKey(supabase, payload.internalCreationKey);

  if (!creationKey || !isCreationKeyUsable({ row: creationKey, email })) {
    return {
      ok: false,
      status: 403,
      message: "A chave de criação não pôde ser validada.",
    };
  }

  return {
    ok: true,
    identity: {
      speciesCode: creationKey.allowed_species_code,
      stageCode: creationKey.allowed_stage_code,
      inclinationCode: creationKey.allowed_inclination_code || payload.botanicInclination || "NULO",
      governanceRoleCode: creationKey.allowed_governance_role_code,
      rootGovernanceEnabled:
        creationKey.allowed_species_code === "IRIS" &&
        creationKey.allowed_stage_code === "BIOMA",
      assignmentSource: "internal_creation_key",
      assignedReason: "Identidade definida por chave interna de criação validada no servidor.",
      metadata: {
        ...creationKey.metadata,
        internalRole: payload.internalRole,
        internalTeam: payload.internalTeam,
      },
    },
    internalCreationKeyId: creationKey.id,
    nextInternalCreationKeyUsage: creationKey.used_count + 1,
  };
}
