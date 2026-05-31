#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const startedAt = new Date();
const root = process.cwd();

function exists(p) {
  return fs.existsSync(p);
}

function resolveWebRoot() {
  if (exists(path.join(root, "web", "src", "app"))) {
    return path.join(root, "web");
  }

  if (exists(path.join(root, "src", "app")) && exists(path.join(root, "package.json"))) {
    return root;
  }

  throw new Error(
    "Não encontrei a aplicação web. Execute este setup na raiz do monorepo IRIS ou dentro da pasta web."
  );
}

const webRoot = resolveWebRoot();
const repoRoot = path.basename(webRoot) === "web" ? path.dirname(webRoot) : webRoot;
const backupRoot = path.join(repoRoot, ".iris-backups", "admin-layout-" + startedAt.toISOString().replace(/[:.]/g, "-"));

const files = new Map();

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function backupIfNeeded(absPath) {
  if (!exists(absPath)) return;

  const relative = path.relative(repoRoot, absPath);
  const backupPath = path.join(backupRoot, relative);

  ensureDir(path.dirname(backupPath));
  fs.copyFileSync(absPath, backupPath);
}

function writeFileFromWeb(relativePath, content) {
  const absPath = path.join(webRoot, relativePath);
  ensureDir(path.dirname(absPath));

  const normalized = content.trimStart().replace(/\s+$/g, "") + "\n";

  if (exists(absPath)) {
    const current = fs.readFileSync(absPath, "utf8");
    if (current === normalized) {
      console.log("= mantido:", path.relative(repoRoot, absPath));
      return;
    }
    backupIfNeeded(absPath);
  }

  fs.writeFileSync(absPath, normalized, "utf8");
  console.log("+ escrito:", path.relative(repoRoot, absPath));
}

function writeRoutePage(relativePath, title, description, badge) {
  const content =
    "// /web/" + relativePath + "\n" +
    "import { AdminPlaceholderPage } from \"@/components/admin/admin-placeholder-page\";\n\n" +
    "export const dynamic = \"force-dynamic\";\n\n" +
    "export default function Page() {\n" +
    "  return (\n" +
    "    <AdminPlaceholderPage\n" +
    "      title=" + JSON.stringify(title) + "\n" +
    "      description=" + JSON.stringify(description) + "\n" +
    "      badge=" + JSON.stringify(badge) + "\n" +
    "    />\n" +
    "  );\n" +
    "}\n";

  writeFileFromWeb(relativePath, content);
}

files.set("src/types/admin.ts", String.raw`
// /web/src/types/admin.ts
export type AdminProfileView = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  username: string | null;
  accountScope: string | null;
  internalRole: string | null;
  internalTeam: string | null;
  onboardingStatus: string | null;
  isActive: boolean;
  botanicIdentityId: string | null;
};

export type EcosystemProfileView = {
  id: string;
  displayName: string | null;
  username: string | null;
  bio: string | null;
  avatarPath: string | null;
  coverPath: string | null;
  profileStatus: string | null;
};

export type BotanicIdentityView = {
  id: string;
  userId: string;
  profileId: string | null;
  speciesCode: string | null;
  stageCode: string | null;
  inclinationCode: string | null;
  accountPrefix: string | null;
  accountNumber: number | null;
  regionCode: string | null;
  countryCode: string | null;
  diagnosticCode: string | null;
  governanceRoleCode: string | null;
  rootGovernanceEnabled: boolean;
  identityStatus: string | null;
};

export type AdminAccessView = {
  isRootGovernance: boolean;
  isEngineering: boolean;
  isModerator: boolean;
  canUseAdmin: boolean;
  label: string;
};

export type AdminLayoutContext = {
  user: {
    id: string;
    email: string;
  };
  profile: AdminProfileView;
  ecosystemProfile: EcosystemProfileView | null;
  identity: BotanicIdentityView;
  access: AdminAccessView;
  pendingAlerts: number;
};

export type AdminLayoutResult =
  | { status: "ok"; context: AdminLayoutContext }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

export type DashboardMetric = {
  label: string;
  value: string;
  description: string;
  state: "available" | "restricted" | "warning";
};

export type DashboardSnapshot = {
  metrics: DashboardMetric[];
  generatedAt: string;
};
`);

files.set("src/constants/admin-navigation.ts", String.raw`
// /web/src/constants/admin-navigation.ts
export type AdminNavigationAccess = "all" | "internal" | "moderation" | "engineering" | "root";

export type AdminNavigationIcon =
  | "LayoutDashboard"
  | "UsersRound"
  | "Building2"
  | "ClipboardCheck"
  | "Sprout"
  | "KeyRound"
  | "ShieldCheck"
  | "ScrollText"
  | "Scale"
  | "Flag"
  | "BookOpen"
  | "Palette"
  | "GitBranch"
  | "FlaskConical"
  | "Wrench"
  | "Route"
  | "ShieldAlert"
  | "ServerCog";

export type AdminNavigationItem = {
  title: string;
  href: string;
  description: string;
  icon: AdminNavigationIcon;
  access: AdminNavigationAccess;
  badge?: "root" | "soon" | "critical";
  keywords: string[];
};

export type AdminNavigationGroup = {
  title: string;
  description: string;
  icon: AdminNavigationIcon;
  access: AdminNavigationAccess;
  items: AdminNavigationItem[];
};

export type AdminAccessContext = {
  accountScope?: string | null;
  internalRole?: string | null;
  internalTeam?: string | null;
  speciesCode?: string | null;
  stageCode?: string | null;
  governanceRoleCode?: string | null;
  rootGovernanceEnabled?: boolean | null;
};

const ENGINEERING_TEAMS = new Set(["devops", "platform", "security", "ai_ml", "qa", "api_integrations"]);
const ENGINEERING_ROLES = new Set(["founder", "director", "root_auditor", "staff_engineering"]);
const MODERATION_ROLES = new Set(["founder", "director", "root_auditor", "staff_curator"]);

export const ADMIN_NAVIGATION_GROUPS: AdminNavigationGroup[] = [
  {
    title: "Ecossistema",
    description: "Visão global do IRÍS Social, perfis e saúde do sistema.",
    icon: "LayoutDashboard",
    access: "internal",
    items: [
      {
        title: "Visão Geral",
        href: "/dashboard",
        description: "Painel principal com contexto do Motor Flora e métricas operacionais seguras.",
        icon: "LayoutDashboard",
        access: "internal",
        keywords: ["dashboard", "visão geral", "métricas", "time well spent"],
      },
      {
        title: "Perfis Globais",
        href: "/dashboard/ecosystem/profiles",
        description: "Consulta de ecosystem_profiles, usernames e status de onboarding.",
        icon: "UsersRound",
        access: "moderation",
        keywords: ["ecosystem_profiles", "perfis", "usuários", "username"],
      },
      {
        title: "Saúde do Ecossistema",
        href: "/dashboard/ecosystem/health",
        description: "Leitura operacional sem expor segredos: sessão, RLS, storage e integridade.",
        icon: "ServerCog",
        access: "engineering",
        keywords: ["status", "infra", "rls", "supabase"],
      },
    ],
  },
  {
    title: "Institucional & B2B",
    description: "Organizações, membros e solicitações de vínculo institucional.",
    icon: "Building2",
    access: "moderation",
    items: [
      {
        title: "Organizações",
        href: "/dashboard/organizations",
        description: "Gestão de admin_organizations e diretórios institucionais.",
        icon: "Building2",
        access: "moderation",
        keywords: ["organizações", "empresas", "admin_organizations", "cnpj"],
      },
      {
        title: "Solicitações Pendentes",
        href: "/dashboard/organizations/requests",
        description: "Revisão de admin_organization_join_requests sem bypassar governança.",
        icon: "ClipboardCheck",
        access: "moderation",
        badge: "critical",
        keywords: ["solicitações", "aprovação", "join requests", "pendentes"],
      },
      {
        title: "Códigos de Acesso",
        href: "/dashboard/organizations/access-codes",
        description: "Gerência de códigos institucionais hashados e rotatividade segura.",
        icon: "KeyRound",
        access: "root",
        keywords: ["códigos", "access codes", "hash", "convites"],
      },
    ],
  },
  {
    title: "Root Governance & Flora",
    description: "Camada sensível: identidades botânicas, chaves internas e auditoria.",
    icon: "ShieldCheck",
    access: "root",
    items: [
      {
        title: "Identidades Botânicas",
        href: "/dashboard/flora/identities",
        description: "Distribuição e revisão de botanic_identities e assinaturas Flora.",
        icon: "Sprout",
        access: "root",
        badge: "root",
        keywords: ["flora", "botanic identities", "diagnostic_code", "governance"],
      },
      {
        title: "Taxonomia Flora",
        href: "/dashboard/flora/taxonomy",
        description: "Espécies, estágios, inclinações e papéis de governança.",
        icon: "ShieldCheck",
        access: "root",
        keywords: ["espécies", "estágios", "inclinações", "roles"],
      },
      {
        title: "Chaves de Criação",
        href: "/dashboard/flora/creation-keys",
        description: "Geração e revogação de botanic_internal_creation_keys.",
        icon: "KeyRound",
        access: "root",
        keywords: ["chaves internas", "creation keys", "hash", "staff"],
      },
      {
        title: "Auditoria Global",
        href: "/dashboard/flora/audit",
        description: "Trilha de botanic_identity_audit_logs e alterações sensíveis.",
        icon: "ScrollText",
        access: "root",
        keywords: ["auditoria", "logs", "segurança", "alterações"],
      },
    ],
  },
  {
    title: "Moderação & Ética",
    description: "Governança de convivência sem quebrar Zero-Knowledge ou E2EE.",
    icon: "Scale",
    access: "moderation",
    items: [
      {
        title: "Comitê de Ética",
        href: "/dashboard/moderation/ethics",
        description: "Casos complexos, mediação e decisões do comitê independente.",
        icon: "Scale",
        access: "moderation",
        keywords: ["ética", "comitê", "mediação", "disputas"],
      },
      {
        title: "Conteúdo & Retenção",
        href: "/dashboard/moderation/content-retention",
        description: "Denúncias e retenção com privacidade; sem leitura de diários íntimos.",
        icon: "ShieldAlert",
        access: "moderation",
        keywords: ["denúncias", "conteúdo", "retenção", "privacidade"],
      },
      {
        title: "Conselhos de Usuários",
        href: "/dashboard/moderation/councils",
        description: "Operação futura dos júris rotativos e reputação comunitária.",
        icon: "Flag",
        access: "moderation",
        badge: "soon",
        keywords: ["conselhos", "júri", "comunidade", "reputação"],
      },
    ],
  },
  {
    title: "Feature Flags",
    description: "Controle de módulos, kill switches e experimentos por perfil.",
    icon: "FlaskConical",
    access: "engineering",
    items: [
      {
        title: "Módulos do Ecossistema",
        href: "/dashboard/feature-flags/modules",
        description: "Ativação controlada de iLIFE, usLIFE, Aurora, Marketplace e integrações.",
        icon: "FlaskConical",
        access: "engineering",
        keywords: ["flags", "módulos", "ilife", "uslife", "aurora"],
      },
      {
        title: "Manutenção e Kill Switches",
        href: "/dashboard/feature-flags/kill-switches",
        description: "Interrupções emergenciais para onboarding, uploads e rotas críticas.",
        icon: "Wrench",
        access: "root",
        badge: "critical",
        keywords: ["kill switch", "manutenção", "uploads", "onboarding"],
      },
      {
        title: "Rotas e Experimentos",
        href: "/dashboard/feature-flags/experiments",
        description: "Liberação gradual por equipe, espécie ou papel de governança.",
        icon: "Route",
        access: "engineering",
        keywords: ["experimentos", "ab test", "rotas", "next"],
      },
    ],
  },
  {
    title: "Documentação & Engenharia",
    description: "Acesso rápido às referências do ecossistema e histórico técnico.",
    icon: "BookOpen",
    access: "moderation",
    items: [
      {
        title: "Arquitetura e Manuais",
        href: "/dashboard/docs/architecture",
        description: "Documentos de arquitetura do Admin, Motor Flora e Product Book.",
        icon: "BookOpen",
        access: "moderation",
        keywords: ["arquitetura", "manual", "product book", "flora"],
      },
      {
        title: "Design System NÓS",
        href: "/dashboard/docs/design-system",
        description: "Tokens, acessibilidade, tipografia e padrões visuais editoriais.",
        icon: "Palette",
        access: "moderation",
        keywords: ["design system", "nós", "tokens", "inter"],
      },
      {
        title: "Guias de Moderação",
        href: "/dashboard/docs/moderation-guides",
        description: "Procedimentos para o Comitê de Ética e análise de conflitos.",
        icon: "Scale",
        access: "moderation",
        keywords: ["moderação", "guias", "ética", "conselhos"],
      },
      {
        title: "Changelog & Migrations",
        href: "/dashboard/docs/changelog",
        description: "Histórico de versões, migrations SQL e decisões operacionais.",
        icon: "GitBranch",
        access: "engineering",
        keywords: ["changelog", "migrations", "supabase", "sql"],
      },
    ],
  },
];

export function isRootAdmin(context: AdminAccessContext): boolean {
  const role = context.governanceRoleCode ?? "";

  return Boolean(
    context.rootGovernanceEnabled ||
      role === "founder" ||
      role === "director" ||
      role === "root_auditor" ||
      (context.speciesCode === "IRIS" && context.stageCode === "BIOMA")
  );
}

export function isEngineeringAdmin(context: AdminAccessContext): boolean {
  return Boolean(
    isRootAdmin(context) ||
      ENGINEERING_TEAMS.has(context.internalTeam ?? "") ||
      ENGINEERING_ROLES.has(context.governanceRoleCode ?? "") ||
      context.internalRole === "dev"
  );
}

export function isModeratorAdmin(context: AdminAccessContext): boolean {
  return Boolean(
    isRootAdmin(context) ||
      context.speciesCode === "TULIPA" ||
      MODERATION_ROLES.has(context.governanceRoleCode ?? "") ||
      context.internalRole === "design" ||
      context.internalRole === "partner"
  );
}

export function canSeeAdminNavigation(access: AdminNavigationAccess, context: AdminAccessContext): boolean {
  if (access === "all") return true;
  if (access === "internal") return context.accountScope === "internal" || isRootAdmin(context);
  if (access === "moderation") return isModeratorAdmin(context);
  if (access === "engineering") return isEngineeringAdmin(context);
  if (access === "root") return isRootAdmin(context);
  return false;
}

export function getAdminNavigationGroups(context: AdminAccessContext): AdminNavigationGroup[] {
  return ADMIN_NAVIGATION_GROUPS
    .filter((group) => canSeeAdminNavigation(group.access, context))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canSeeAdminNavigation(item.access, context)),
    }))
    .filter((group) => group.items.length > 0);
}

export function findAdminNavigationItem(pathname: string, groups: AdminNavigationGroup[] = ADMIN_NAVIGATION_GROUPS) {
  const allItems = groups.flatMap((group) => group.items);

  return (
    allItems.find((item) => item.href === pathname) ??
    allItems
      .filter((item) => item.href !== "/dashboard")
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname.startsWith(item.href)) ??
    allItems.find((item) => item.href === "/dashboard")
  );
}
`);

files.set("src/lib/admin/admin-context.ts", String.raw`
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
`);

files.set("src/components/admin/admin-shell.tsx", String.raw`
// /web/src/components/admin/admin-shell.tsx
"use client";

import * as React from "react";
import { getAdminNavigationGroups } from "@/constants/admin-navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import type { AdminLayoutContext } from "@/types/admin";

type AdminShellProps = {
  context: AdminLayoutContext;
  children: React.ReactNode;
};

export function AdminShell({ context, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const navigationGroups = React.useMemo(
    () =>
      getAdminNavigationGroups({
        accountScope: context.profile.accountScope,
        internalRole: context.profile.internalRole,
        internalTeam: context.profile.internalTeam,
        speciesCode: context.identity.speciesCode,
        stageCode: context.identity.stageCode,
        governanceRoleCode: context.identity.governanceRoleCode,
        rootGovernanceEnabled: context.identity.rootGovernanceEnabled,
      }),
    [context]
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#111111] selection:bg-[#006D4E]/15 dark:bg-[#111111] dark:text-[#FAF7F2]">
      <AdminSidebar
        currentAdmin={context}
        groups={navigationGroups}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={collapsed ? "min-h-screen transition-[padding] duration-300 ease-out motion-reduce:transition-none lg:pl-[116px]" : "min-h-screen transition-[padding] duration-300 ease-out motion-reduce:transition-none lg:pl-[336px]"}>
        <AdminTopbar
          currentAdmin={context}
          groups={navigationGroups}
          pendingAlerts={context.pendingAlerts}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
`);

files.set("src/components/admin/admin-sidebar.tsx", String.raw`
// /web/src/components/admin/admin-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Flag,
  FlaskConical,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Route,
  Scale,
  ScrollText,
  ServerCog,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import type { AdminLayoutContext } from "@/types/admin";
import type { AdminNavigationGroup, AdminNavigationIcon } from "@/constants/admin-navigation";

type AdminSidebarProps = {
  currentAdmin: AdminLayoutContext;
  groups: AdminNavigationGroup[];
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const ICONS: Record<AdminNavigationIcon, LucideIcon> = {
  LayoutDashboard,
  UsersRound,
  Building2,
  ClipboardCheck,
  Sprout,
  KeyRound,
  ShieldCheck,
  ScrollText,
  Scale,
  Flag,
  BookOpen,
  Palette,
  GitBranch,
  FlaskConical,
  Wrench,
  Route,
  ShieldAlert,
  ServerCog,
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function initials(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "I";
  const second = parts[1]?.[0] ?? "R";

  return (first + second).toUpperCase();
}

function getDisplayName(currentAdmin: AdminLayoutContext): string {
  return currentAdmin.profile.fullName ?? currentAdmin.ecosystemProfile?.displayName ?? currentAdmin.user.email.split("@")[0] ?? "Admin IRÍS";
}

function getDisplayUsername(currentAdmin: AdminLayoutContext): string {
  const username = currentAdmin.profile.username ?? currentAdmin.ecosystemProfile?.username;
  return username ? "@" + username : currentAdmin.user.email;
}

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function Badge({ badge }: { badge?: "root" | "soon" | "critical" }) {
  if (!badge) return null;

  const label = badge === "root" ? "Root" : badge === "soon" ? "Em breve" : "Atenção";

  return (
    <span
      className={cx(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
        badge === "critical" && "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
        badge === "root" && "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E] dark:border-[#006D4E]/40 dark:bg-[#006D4E]/20",
        badge === "soon" && "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]"
      )}
    >
      {label}
    </span>
  );
}

function SidebarItem({
  href,
  title,
  description,
  icon,
  badge,
  pathname,
  onNavigate,
}: {
  href: string;
  title: string;
  description: string;
  icon: AdminNavigationIcon;
  badge?: "root" | "soon" | "critical";
  pathname: string;
  onNavigate: () => void;
}) {
  const active = isItemActive(pathname, href);
  const Icon = ICONS[icon];

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cx(
        "group flex items-start gap-3 rounded-2xl border px-3 py-2.5 text-sm transition duration-200 motion-reduce:transition-none",
        active
          ? "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E] shadow-sm dark:border-[#006D4E]/40 dark:bg-[#006D4E]/15"
          : "border-transparent text-[#444444] hover:border-[#E0DDD6] hover:bg-white/70 hover:text-[#111111] dark:text-[#C0C0C0] dark:hover:border-[#2A2A2A] dark:hover:bg-white/[0.04] dark:hover:text-[#FAF7F2]"
      )}
    >
      <Icon
        className={cx("mt-0.5 size-4 shrink-0", active ? "text-[#006D4E]" : "text-[#666666] group-hover:text-[#006D4E]")}
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-medium">{title}</span>
          <Badge badge={badge} />
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-[#666666] dark:text-[#8A8A8A]">{description}</span>
      </span>
    </Link>
  );
}

export function AdminSidebar({ currentAdmin, groups, mobileOpen, setMobileOpen, collapsed, setCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const displayName = getDisplayName(currentAdmin);
  const displayUsername = getDisplayUsername(currentAdmin);
  const diagnosticCode = currentAdmin.identity.diagnosticCode ?? "IRIS-IDENTITY-PENDING";

  return (
    <>
      <button
        type="button"
        aria-label="Fechar navegação administrativa"
        className={cx(
          "fixed inset-0 z-40 bg-[#111111]/20 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cx(
          "fixed left-0 top-0 z-50 flex h-dvh w-[304px] flex-col border-r border-[#E0DDD6] bg-white/92 shadow-[0_24px_70px_rgba(17,17,17,0.10)] backdrop-blur-2xl transition-[transform,width] duration-300 ease-out motion-reduce:transition-none dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/92 lg:left-5 lg:top-5 lg:h-[calc(100dvh-40px)] lg:rounded-[28px] lg:border",
          collapsed ? "lg:w-[76px]" : "lg:w-[296px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Navegação administrativa IRÍS"
      >
        <header className={cx("flex items-center border-b border-[#E0DDD6]/80 px-4 py-4 dark:border-[#2A2A2A]", collapsed ? "lg:justify-center" : "justify-between")}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[#006D4E]/15 bg-[#006D4E]/10 text-[#006D4E] shadow-sm">
              <Sparkles className="size-4" strokeWidth={1.75} />
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-[0.18em] text-[#111111] dark:text-[#FAF7F2]">IRÍS</span>
                <span className="block truncate text-xs text-[#666666] dark:text-[#8A8A8A]">Admin Social</span>
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              aria-label="Fechar menu no mobile"
              className="grid size-9 place-items-center rounded-full border border-[#E0DDD6] bg-white/70 text-[#666666] transition hover:text-[#111111] dark:border-[#2A2A2A] dark:bg-white/[0.04] dark:hover:text-[#FAF7F2] lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <nav className="space-y-3">
            {groups.map((group) => {
              const GroupIcon = ICONS[group.icon];
              const activeGroup = group.items.some((item) => isItemActive(pathname, item.href));

              if (collapsed) {
                const firstItem = group.items[0];

                return (
                  <Link
                    key={group.title}
                    href={firstItem?.href ?? "/dashboard"}
                    title={group.title + " — " + group.description}
                    className={cx(
                      "hidden place-items-center rounded-2xl border p-3 transition lg:grid",
                      activeGroup
                        ? "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]"
                        : "border-transparent text-[#666666] hover:border-[#E0DDD6] hover:bg-white/70 hover:text-[#006D4E] dark:hover:border-[#2A2A2A] dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <GroupIcon className="size-4" strokeWidth={1.75} />
                    <span className="sr-only">{group.title}</span>
                  </Link>
                );
              }

              return (
                <details key={group.title} className="group rounded-3xl" open={activeGroup || group.title === "Ecossistema"}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#111111] transition hover:bg-white/70 dark:text-[#FAF7F2] dark:hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
                    <GroupIcon className={cx("size-4", activeGroup ? "text-[#006D4E]" : "text-[#666666]")} strokeWidth={1.75} />
                    <span className="min-w-0 flex-1 truncate">{group.title}</span>
                    <ChevronDown className="size-4 text-[#8A8A8A] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>

                  <div className="mt-1 space-y-1 pl-2">
                    {group.items.map((item) => (
                      <SidebarItem
                        key={item.href}
                        href={item.href}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        badge={item.badge}
                        pathname={pathname}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </nav>
        </div>

        <footer className="border-t border-[#E0DDD6]/80 bg-white/60 p-3 backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-white/[0.03]">
          <div className={cx("rounded-[24px] border border-[#E0DDD6] bg-[#FAF7F2]/80 p-3 dark:border-[#2A2A2A] dark:bg-[#111111]/70", collapsed ? "lg:p-2" : "")}>
            <div className={cx("flex items-center gap-3", collapsed ? "lg:justify-center" : "")}>
              <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#111111] text-xs font-semibold text-[#FAF7F2] dark:bg-[#FAF7F2] dark:text-[#111111]">
                {initials(displayName, currentAdmin.user.email)}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{displayName}</p>
                  <p className="truncate text-xs text-[#666666] dark:text-[#8A8A8A]">{displayUsername}</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="mt-3 rounded-2xl border border-[#006D4E]/15 bg-[#006D4E]/10 p-3 text-[#006D4E]">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Sprout className="size-3.5" />
                  <span>{currentAdmin.access.label}</span>
                </div>
                <p className="mt-1 break-words font-mono text-[10px] leading-4 text-[#183A2E] dark:text-[#BDE8D7]">{diagnosticCode}</p>
              </div>
            )}

            <div className={cx("mt-3 grid gap-1", collapsed ? "lg:hidden" : "")}>
              <Link href="/settings/profile" className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-[#444444] transition hover:bg-white dark:text-[#C0C0C0] dark:hover:bg-white/[0.04]">
                <UserRound className="size-3.5" /> Meu perfil
              </Link>
              <Link href="/settings" className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-[#444444] transition hover:bg-white dark:text-[#C0C0C0] dark:hover:bg-white/[0.04]">
                <Settings className="size-3.5" /> Preferências
              </Link>
              <Link href="/logout" className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30">
                <LogOut className="size-3.5" /> Sair
              </Link>
            </div>
          </div>

          <button
            type="button"
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            className="mt-3 hidden w-full items-center justify-center gap-2 rounded-2xl border border-[#E0DDD6] bg-white/70 px-3 py-2 text-xs font-medium text-[#666666] transition hover:text-[#111111] dark:border-[#2A2A2A] dark:bg-white/[0.04] dark:hover:text-[#FAF7F2] lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="size-4" />
            {!collapsed && "Recolher"}
          </button>
        </footer>
      </aside>
    </>
  );
}
`);

files.set("src/components/admin/admin-topbar.tsx", String.raw`
// /web/src/components/admin/admin-topbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Search, ShieldCheck } from "lucide-react";
import { findAdminNavigationItem } from "@/constants/admin-navigation";
import type { AdminNavigationGroup } from "@/constants/admin-navigation";
import type { AdminLayoutContext } from "@/types/admin";

type AdminTopbarProps = {
  currentAdmin: AdminLayoutContext;
  groups: AdminNavigationGroup[];
  pendingAlerts: number;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
};

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Admin",
  ecosystem: "Ecossistema",
  profiles: "Perfis Globais",
  health: "Saúde",
  organizations: "Organizações",
  requests: "Solicitações",
  "access-codes": "Códigos",
  flora: "Motor Flora",
  identities: "Identidades",
  taxonomy: "Taxonomia",
  "creation-keys": "Chaves de Criação",
  audit: "Auditoria",
  moderation: "Moderação",
  ethics: "Comitê de Ética",
  "content-retention": "Conteúdo & Retenção",
  councils: "Conselhos",
  "feature-flags": "Feature Flags",
  modules: "Módulos",
  "kill-switches": "Kill Switches",
  experiments: "Experimentos",
  docs: "Documentação",
  architecture: "Arquitetura",
  "design-system": "Design System",
  "moderation-guides": "Guias",
  changelog: "Changelog",
};

function formatSegment(segment: string): string {
  return BREADCRUMB_LABELS[segment] ?? segment.replace(/-/g, " ").replace(/^\w/, (match) => match.toUpperCase());
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label: formatSegment(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
    current: index === segments.length - 1,
  }));
}

export function AdminTopbar({ currentAdmin, groups, pendingAlerts, collapsed, setCollapsed, setMobileOpen }: AdminTopbarProps) {
  const pathname = usePathname();
  const breadcrumbs = React.useMemo(() => buildBreadcrumbs(pathname), [pathname]);
  const activeItem = React.useMemo(() => findAdminNavigationItem(pathname, groups), [pathname, groups]);

  return (
    <div className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 rounded-[28px] border border-[#E0DDD6]/90 bg-white/78 px-3 shadow-[0_16px_50px_rgba(17,17,17,0.06)] backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/78 sm:px-4">
        <button
          type="button"
          aria-label="Abrir navegação administrativa"
          className="grid size-10 place-items-center rounded-full border border-[#E0DDD6] bg-[#FAF7F2]/80 text-[#444444] transition hover:text-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#111111]/80 dark:text-[#C0C0C0] lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-4" />
        </button>

        <button
          type="button"
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          className="hidden size-10 place-items-center rounded-full border border-[#E0DDD6] bg-[#FAF7F2]/80 text-[#444444] transition hover:text-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#111111]/80 dark:text-[#C0C0C0] lg:grid"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="size-4" />
        </button>

        <div className="h-8 w-px bg-[#E0DDD6] dark:bg-[#2A2A2A]" />

        <div className="min-w-0 flex-1">
          <nav className="hidden items-center gap-1 overflow-hidden text-xs text-[#666666] dark:text-[#8A8A8A] sm:flex" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {crumb.current ? (
                  <span className="truncate font-medium text-[#111111] dark:text-[#FAF7F2]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="truncate transition hover:text-[#006D4E]">
                    {crumb.label}
                  </Link>
                )}
                {index < breadcrumbs.length - 1 && <ChevronRight className="size-3.5 shrink-0 text-[#8A8A8A]" />}
              </React.Fragment>
            ))}
          </nav>
          <p className="truncate text-sm font-medium text-[#111111] dark:text-[#FAF7F2] sm:mt-0.5">{activeItem?.title ?? "Admin IRÍS"}</p>
        </div>

        <form className="relative hidden w-56 items-center text-[#666666] md:flex lg:w-72" role="search" onSubmit={(event) => event.preventDefault()}>
          <Search className="pointer-events-none absolute left-3.5 size-4" strokeWidth={1.75} />
          <input
            type="search"
            aria-label="Busca global administrativa"
            placeholder="Buscar username, CNPJ, código..."
            className="h-10 w-full rounded-full border border-[#E0DDD6] bg-[#FAF7F2]/70 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#8A8A8A] focus:border-[#006D4E]/50 focus:bg-white focus:ring-4 focus:ring-[#006D4E]/10 dark:border-[#2A2A2A] dark:bg-[#111111]/70 dark:text-[#FAF7F2] dark:focus:bg-[#111111]"
          />
        </form>

        <div className="hidden items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-2 text-xs font-medium text-[#006D4E] xl:flex">
          <ShieldCheck className="size-4" />
          <span>{currentAdmin.access.isRootGovernance ? "Sessão Root SSR" : "Sessão SSR segura"}</span>
        </div>

        <Link
          href="/dashboard/organizations/requests"
          aria-label={pendingAlerts + " notificações administrativas pendentes"}
          className="relative grid size-10 place-items-center rounded-full border border-[#E0DDD6] bg-[#FAF7F2]/80 text-[#444444] transition hover:text-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#111111]/80 dark:text-[#C0C0C0]"
        >
          <Bell className="size-4" />
          {pendingAlerts > 0 && (
            <span className="absolute right-2 top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#006D4E] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white dark:ring-[#1C1C1C]">
              {pendingAlerts > 9 ? "9+" : pendingAlerts}
            </span>
          )}
        </Link>
      </header>
    </div>
  );
}
`);

files.set("src/components/admin/admin-placeholder-page.tsx", String.raw`
// /web/src/components/admin/admin-placeholder-page.tsx
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  badge: string;
};

export function AdminPlaceholderPage({ title, description, badge }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] border border-[#E0DDD6] bg-white/78 p-6 shadow-[0_20px_70px_rgba(17,17,17,0.06)] backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/78 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#006D4E]/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-xs font-medium text-[#006D4E]">
            <Sparkles className="size-3.5" />
            {badge}
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2] sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">{description}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#E0DDD6] bg-white/72 p-5 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ShieldCheck className="size-4 text-[#006D4E]" /> Segurança preservada
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            Esta rota já herda o layout protegido do Dashboard. A implementação real deve continuar usando Server Components, RLS e validação no servidor.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#E0DDD6] bg-white/72 p-5 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ArrowUpRight className="size-4 text-[#006D4E]" /> Próximo incremento
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            O placeholder evita 404 durante a navegação e deixa o caminho preparado para a próxima tela real do Admin.
          </p>
        </article>
      </section>
    </div>
  );
}
`);

files.set("src/app/dashboard/layout.tsx", String.raw`
// /web/src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminLayoutContext } from "@/lib/admin/admin-context";

export const dynamic = "force-dynamic";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const result = await getAdminLayoutContext();

  if (result.status === "unauthenticated") {
    redirect("/login?redirectTo=/dashboard");
  }

  if (result.status === "forbidden") {
    redirect("/login");
  }

  return <AdminShell context={result.context}>{children}</AdminShell>;
}
`);

files.set("src/app/dashboard/page.tsx", String.raw`
// /web/src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { ArrowUpRight, Building2, ClipboardCheck, LockKeyhole, ShieldCheck, Sparkles, Sprout, UsersRound } from "lucide-react";
import { getAdminDashboardSnapshot, getAdminLayoutContext } from "@/lib/admin/admin-context";
import type { DashboardMetric } from "@/types/admin";

export const dynamic = "force-dynamic";

function metricIcon(label: string) {
  if (label.includes("Perfis")) return UsersRound;
  if (label.includes("Organizações")) return Building2;
  if (label.includes("Solicitações")) return ClipboardCheck;
  if (label.includes("Flora")) return Sprout;
  return ShieldCheck;
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = metricIcon(metric.label);

  const stateClass =
    metric.state === "warning"
      ? "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]"
      : metric.state === "restricted"
        ? "border-[#E0DDD6] bg-white/65 text-[#666666] dark:border-[#2A2A2A] dark:bg-white/[0.03] dark:text-[#8A8A8A]"
        : "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]";

  return (
    <article className="rounded-[28px] border border-[#E0DDD6] bg-white/78 p-5 shadow-[0_16px_50px_rgba(17,17,17,0.05)] backdrop-blur-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/78">
      <div className="flex items-start justify-between gap-4">
        <div className={"grid size-11 place-items-center rounded-2xl border " + stateClass}>
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        {metric.state === "restricted" && <LockKeyhole className="size-4 text-[#8A8A8A]" />}
      </div>

      <p className="mt-5 text-sm text-[#666666] dark:text-[#8A8A8A]">{metric.label}</p>
      <strong className="mt-1 block text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">{metric.value}</strong>
      <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">{metric.description}</p>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const result = await getAdminLayoutContext();

  if (result.status === "unauthenticated") {
    redirect("/login?redirectTo=/dashboard");
  }

  if (result.status === "forbidden") {
    redirect("/login");
  }

  const { context } = result;
  const snapshot = await getAdminDashboardSnapshot(context);
  const displayName = context.profile.fullName ?? context.ecosystemProfile?.displayName ?? "Administrador IRÍS";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-[#E0DDD6] bg-white/78 p-6 shadow-[0_20px_70px_rgba(17,17,17,0.06)] backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/78 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#006D4E]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-16 size-56 rounded-full bg-[#9A7CA7]/10 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-xs font-medium text-[#006D4E]">
              <Sparkles className="size-3.5" />
              {context.access.label}
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2] sm:text-4xl">Painel Administrativo IRÍS</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">
              Bem-vindo, {displayName}. Este painel prioriza identidade, governança, instituições e segurança, sem expor segredos no cliente e sem transformar Root Governance em acesso a conteúdo íntimo.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#006D4E]/15 bg-[#006D4E]/10 p-4 text-[#183A2E] dark:text-[#BDE8D7]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#006D4E]">Assinatura Flora</p>
            <p className="mt-2 max-w-sm break-words font-mono text-xs leading-6">{context.identity.diagnosticCode ?? "Identidade pendente"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[28px] border border-[#E0DDD6] bg-white/72 p-5 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ShieldCheck className="size-4 text-[#006D4E]" /> Segurança server-first
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            O layout valida sessão, admin_profile e botanic_identity no servidor antes de renderizar a interface administrativa.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#E0DDD6] bg-white/72 p-5 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <Sprout className="size-4 text-[#006D4E]" /> Motor Flora
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            A navegação é derivada de espécie, estágio, papel de governança, escopo e time interno. Permissão crítica não nasce no frontend.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#E0DDD6] bg-white/72 p-5 dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ArrowUpRight className="size-4 text-[#006D4E]" /> Próximo bloco
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            A partir daqui podemos criar as telas reais de Root Governance: solicitações, chaves internas, códigos de organização e auditoria.
          </p>
        </article>
      </section>
    </div>
  );
}
`);

files.set("src/app/admin/page.tsx", String.raw`
// /web/src/app/admin/page.tsx
import { redirect } from "next/navigation";

export default function AdminCompatibilityRedirectPage() {
  redirect("/dashboard");
}
`);

for (const [relativePath, content] of files.entries()) {
  writeFileFromWeb(relativePath, content);
}

const placeholderRoutes = [
  ["src/app/dashboard/ecosystem/profiles/page.tsx", "Perfis Globais", "Consulta de perfis globais do ecossistema, usernames e status de onboarding.", "Ecossistema"],
  ["src/app/dashboard/ecosystem/health/page.tsx", "Saúde do Ecossistema", "Leitura operacional segura para sessão, Supabase, RLS, storage e integridade.", "Engenharia"],
  ["src/app/dashboard/organizations/page.tsx", "Organizações", "Gestão institucional de empresas, diretórios e vínculos B2B.", "Institucional"],
  ["src/app/dashboard/organizations/requests/page.tsx", "Solicitações Pendentes", "Revisão de solicitações de associação institucional sem bypassar governança.", "Institucional"],
  ["src/app/dashboard/organizations/access-codes/page.tsx", "Códigos de Acesso", "Gerência de códigos institucionais hashados, expiração e rotatividade segura.", "Root Governance"],
  ["src/app/dashboard/flora/identities/page.tsx", "Identidades Botânicas", "Gestão de botanic_identities, assinaturas Flora e poderes de governança.", "Root Governance"],
  ["src/app/dashboard/flora/taxonomy/page.tsx", "Taxonomia Flora", "Catálogo de espécies, estágios, inclinações e papéis de governança.", "Root Governance"],
  ["src/app/dashboard/flora/creation-keys/page.tsx", "Chaves de Criação", "Geração e revogação de chaves internas para perfis elevados.", "Root Governance"],
  ["src/app/dashboard/flora/audit/page.tsx", "Auditoria Global", "Trilha de auditoria para alterações sensíveis do Motor Flora.", "Root Governance"],
  ["src/app/dashboard/moderation/ethics/page.tsx", "Comitê de Ética", "Gestão futura de casos complexos, mediação e decisões do comitê.", "Moderação"],
  ["src/app/dashboard/moderation/content-retention/page.tsx", "Conteúdo & Retenção", "Monitoramento de denúncias sem quebrar privacidade, E2EE ou Zero-Knowledge.", "Moderação"],
  ["src/app/dashboard/moderation/councils/page.tsx", "Conselhos de Usuários", "Operação futura de júris rotativos, reputação comunitária e disputas.", "Moderação"],
  ["src/app/dashboard/feature-flags/modules/page.tsx", "Módulos do Ecossistema", "Controle de liberação de iLIFE, usLIFE, Aurora, Marketplace e integrações.", "Feature Flags"],
  ["src/app/dashboard/feature-flags/kill-switches/page.tsx", "Manutenção e Kill Switches", "Chaves emergenciais para pausar onboarding, uploads e rotas críticas.", "Feature Flags"],
  ["src/app/dashboard/feature-flags/experiments/page.tsx", "Rotas e Experimentos", "Liberação gradual por espécie, equipe, papel de governança ou rota.", "Feature Flags"],
  ["src/app/dashboard/docs/architecture/page.tsx", "Arquitetura e Manuais", "Central interna para arquitetura do Admin, Motor Flora e Product Book.", "Documentação"],
  ["src/app/dashboard/docs/design-system/page.tsx", "Design System NÓS", "Consulta de tokens, cores, tipografia, acessibilidade e padrões editoriais.", "Documentação"],
  ["src/app/dashboard/docs/moderation-guides/page.tsx", "Guias de Moderação", "Procedimentos para Comitê de Ética, denúncias e conselhos de usuários.", "Documentação"],
  ["src/app/dashboard/docs/changelog/page.tsx", "Changelog & Migrations", "Histórico de versões, migrations SQL e decisões operacionais.", "Documentação"],
];

for (const route of placeholderRoutes) {
  writeRoutePage(route[0], route[1], route[2], route[3]);
}

const packagePath = path.join(webRoot, "package.json");
if (exists(packagePath) && process.env.IRIS_SKIP_TYPECHECK !== "1") {
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  if (pkg.scripts && pkg.scripts.typecheck) {
    console.log("\nExecutando typecheck...");
    const result = spawnSync("npm", ["run", "typecheck"], {
      cwd: webRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    if (result.status !== 0) {
      console.error("\nTypecheck falhou. Os arquivos foram escritos e os backups estão em:");
      console.error(backupRoot);
      process.exit(result.status ?? 1);
    }
  } else {
    console.log("\nSem script typecheck no package.json. Validação automática pulada.");
  }
}

console.log("\nSetup Admin Layout concluído.");
console.log("Web root:", webRoot);
console.log("Backups, se houve sobrescrita:", backupRoot);
console.log("\nPróximos comandos sugeridos:");
console.log("cd " + webRoot);
console.log("npm run dev");
