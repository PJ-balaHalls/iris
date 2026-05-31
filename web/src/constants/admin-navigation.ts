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
