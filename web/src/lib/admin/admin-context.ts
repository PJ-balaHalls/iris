// /web/src/lib/admin/admin-context.ts
import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isEngineeringAdmin, isModeratorAdmin, isRootAdmin } from "@/constants/admin-navigation";
import type {
  AdminAccessView,
  AdminLayoutContext,
  AdminLayoutResult,
  AdminProfileView,
  BotanicIdentityView,
  DashboardMetric,
  DashboardSnapshot,
  EcosystemProfileView,
} from "@/types/admin";

type UnknownRecord = Record<string, unknown>;

type CountTable =
  | "ecosystem_profiles"
  | "botanic_identities"
  | "admin_organizations"
  | "admin_organization_join_requests"
  | "botanic_identity_audit_logs";

type WritableCookieStore = {
  set: (name: string, value: string, options?: object) => void;
};

function hasCookieSetter(value: unknown): value is WritableCookieStore {
  return Boolean(value && typeof value === "object" && "set" in value && typeof (value as WritableCookieStore).set === "function");
}

function readPublicSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("IRIS_ADMIN_SUPABASE_PUBLIC_ENV_MISSING");
  }

  return { supabaseUrl, supabaseKey };
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeAdminProfile(row: unknown): AdminProfileView | null {
  if (!row || typeof row !== "object") return null;

  const record = row as UnknownRecord;
  const id = asString(record.id);
  const userId = asString(record.user_id);
  const email = asString(record.email);

  if (!id || !userId || !email) return null;

  return {
    id,
    userId,
    email,
    fullName: asString(record.full_name),
    username: asString(record.username),
    accountScope: asString(record.account_scope),
    internalRole: asString(record.internal_role),
    internalTeam: asString(record.internal_team),
    onboardingStatus: asString(record.onboarding_status),
    isActive: asBoolean(record.is_active, true),
    botanicIdentityId: asString(record.botanic_identity_id),
  };
}

function normalizeEcosystemProfile(row: unknown): EcosystemProfileView | null {
  if (!row || typeof row !== "object") return null;

  const record = row as UnknownRecord;
  const id = asString(record.id);

  if (!id) return null;

  return {
    id,
    displayName: asString(record.display_name),
    username: asString(record.username),
    bio: asString(record.bio),
    avatarPath: asString(record.avatar_path),
    coverPath: asString(record.cover_path),
    profileStatus: asString(record.profile_status),
  };
}

function normalizeBotanicIdentity(row: unknown): BotanicIdentityView | null {
  if (!row || typeof row !== "object") return null;

  const record = row as UnknownRecord;
  const id = asString(record.id);
  const userId = asString(record.user_id);

  if (!id || !userId) return null;

  return {
    id,
    userId,
    profileId: asString(record.profile_id),
    speciesCode: asString(record.species_code),
    stageCode: asString(record.stage_code),
    inclinationCode: asString(record.inclination_code),
    accountPrefix: asString(record.account_prefix),
    accountNumber: asNumber(record.account_number),
    regionCode: asString(record.region_code),
    countryCode: asString(record.country_code),
    diagnosticCode: asString(record.diagnostic_code),
    governanceRoleCode: asString(record.governance_role_code),
    rootGovernanceEnabled: asBoolean(record.root_governance_enabled),
    identityStatus: asString(record.identity_status),
  };
}

function buildAccess(profile: AdminProfileView, identity: BotanicIdentityView): AdminAccessView {
  const accessContext = {
    accountScope: profile.accountScope,
    internalRole: profile.internalRole,
    internalTeam: profile.internalTeam,
    speciesCode: identity.speciesCode,
    stageCode: identity.stageCode,
    governanceRoleCode: identity.governanceRoleCode,
    rootGovernanceEnabled: identity.rootGovernanceEnabled,
  };

  const root = isRootAdmin(accessContext);
  const engineering = isEngineeringAdmin(accessContext);
  const moderator = isModeratorAdmin(accessContext);

  const canUseAdmin = Boolean(
    profile.isActive &&
      identity.identityStatus === "active" &&
      (profile.accountScope === "internal" || root || moderator || engineering)
  );

  return {
    isRootGovernance: root,
    isEngineering: engineering,
    isModerator: moderator,
    canUseAdmin,
    label: root ? "Root Governance" : engineering ? "Engenharia IRÍS" : moderator ? "Moderação IRÍS" : "Admin IRÍS",
  };
}

export async function createIrisAdminServerClient(): Promise<SupabaseClient> {
  const { supabaseUrl, supabaseKey } = readPublicSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const cookieToSet of cookiesToSet) {
          try {
            if (hasCookieSetter(cookieStore)) {
              cookieStore.set(cookieToSet.name, cookieToSet.value, cookieToSet.options);
            }
          } catch {
            // Server Components podem ser read-only. O middleware segue responsável por refresh de sessão.
          }
        }
      },
    },
  });
}

async function countRows(supabase: SupabaseClient, table: CountTable, status?: string): Promise<number | null> {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  if (status && table === "admin_organization_join_requests") {
    query = query.eq("status", status);
  }

  const response = await query;

  if (response.error) {
    console.warn("[IRIS_ADMIN_COUNT_RESTRICTED]", { table, code: response.error.code });
    return null;
  }

  return typeof response.count === "number" ? response.count : null;
}

export const getAdminLayoutContext = cache(async (): Promise<AdminLayoutResult> => {
  let supabase: SupabaseClient;

  try {
    supabase = await createIrisAdminServerClient();
  } catch (error) {
    console.error("[IRIS_ADMIN_BOOTSTRAP_FAILED]", error instanceof Error ? error.message : "unknown");
    return { status: "forbidden" };
  }

  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  if (userResponse.error || !user) {
    return { status: "unauthenticated" };
  }

  const [profileResponse, ecosystemResponse, identityResponse] = await Promise.all([
    supabase
      .from("admin_profiles")
      .select("id,user_id,email,full_name,username,account_scope,internal_role,internal_team,onboarding_status,is_active,botanic_identity_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("ecosystem_profiles")
      .select("id,display_name,username,bio,avatar_path,cover_path,profile_status")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("botanic_identities")
      .select("id,user_id,profile_id,species_code,stage_code,inclination_code,account_prefix,account_number,region_code,country_code,diagnostic_code,governance_role_code,root_governance_enabled,identity_status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (profileResponse.error) {
    console.warn("[IRIS_ADMIN_PROFILE_QUERY_FAILED]", { code: profileResponse.error.code });
  }

  if (ecosystemResponse.error) {
    console.warn("[IRIS_ADMIN_ECOSYSTEM_PROFILE_QUERY_FAILED]", { code: ecosystemResponse.error.code });
  }

  if (identityResponse.error) {
    console.warn("[IRIS_ADMIN_IDENTITY_QUERY_FAILED]", { code: identityResponse.error.code });
  }

  const profile = normalizeAdminProfile(profileResponse.data);
  const ecosystemProfile = normalizeEcosystemProfile(ecosystemResponse.data);
  const identity = normalizeBotanicIdentity(identityResponse.data);

  if (!profile || !identity) {
    return { status: "forbidden" };
  }

  const access = buildAccess(profile, identity);

  if (!access.canUseAdmin) {
    return { status: "forbidden" };
  }

  const pendingAlerts = access.isModerator
    ? (await countRows(supabase, "admin_organization_join_requests", "pending")) ?? 0
    : 0;

  return {
    status: "ok",
    context: {
      user: {
        id: user.id,
        email: user.email ?? profile.email,
      },
      profile,
      ecosystemProfile,
      identity,
      access,
      pendingAlerts,
    },
  };
});

export const getAdminDashboardSnapshot = cache(async (context: AdminLayoutContext): Promise<DashboardSnapshot> => {
  const supabase = await createIrisAdminServerClient();

  const [profilesCount, organizationsCount, identitiesCount, pendingRequestsCount, auditCount] = await Promise.all([
    context.access.isModerator ? countRows(supabase, "ecosystem_profiles") : Promise.resolve(null),
    context.access.isModerator ? countRows(supabase, "admin_organizations") : Promise.resolve(null),
    context.access.isRootGovernance ? countRows(supabase, "botanic_identities") : Promise.resolve(null),
    context.access.isModerator ? countRows(supabase, "admin_organization_join_requests", "pending") : Promise.resolve(null),
    context.access.isRootGovernance ? countRows(supabase, "botanic_identity_audit_logs") : Promise.resolve(null),
  ]);

  const metrics: DashboardMetric[] = [
    {
      label: "Perfis globais",
      value: profilesCount === null ? "RLS" : profilesCount.toLocaleString("pt-BR"),
      description: profilesCount === null ? "Leitura protegida pelas políticas atuais." : "ecosystem_profiles acessíveis ao contexto atual.",
      state: profilesCount === null ? "restricted" : "available",
    },
    {
      label: "Organizações",
      value: organizationsCount === null ? "RLS" : organizationsCount.toLocaleString("pt-BR"),
      description: organizationsCount === null ? "Acesso depende de vínculo ou Root Governance." : "admin_organizations visíveis para revisão institucional.",
      state: organizationsCount === null ? "restricted" : "available",
    },
    {
      label: "Solicitações pendentes",
      value: pendingRequestsCount === null ? "RLS" : pendingRequestsCount.toLocaleString("pt-BR"),
      description: pendingRequestsCount === null ? "Sem permissão de leitura global nesta sessão." : "admin_organization_join_requests aguardando análise.",
      state: pendingRequestsCount && pendingRequestsCount > 0 ? "warning" : pendingRequestsCount === null ? "restricted" : "available",
    },
    {
      label: "Identidades Flora",
      value: identitiesCount === null ? "Root" : identitiesCount.toLocaleString("pt-BR"),
      description: identitiesCount === null ? "Métrica restrita à Root Governance." : "botanic_identities sob governança ativa.",
      state: identitiesCount === null ? "restricted" : "available",
    },
    {
      label: "Eventos de auditoria",
      value: auditCount === null ? "Root" : auditCount.toLocaleString("pt-BR"),
      description: auditCount === null ? "Trilha sensível disponível apenas para raiz." : "botanic_identity_audit_logs registrados.",
      state: auditCount === null ? "restricted" : "available",
    },
  ];

  return {
    metrics,
    generatedAt: new Date().toISOString(),
  };
});
