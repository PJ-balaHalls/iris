// /web/src/app/dashboard/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Fingerprint,
  Flag,
  GitBranch,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  Orbit,
  Palette,
  Route,
  Scale,
  ShieldCheck,
  Sparkles,
  Sprout,
  TerminalSquare,
  UsersRound,
  Waves,
  Wrench,
} from "lucide-react";
import { getAdminDashboardSnapshot, getAdminLayoutContext } from "@/lib/admin/admin-context";
import type { AdminLayoutContext, DashboardMetric } from "@/types/admin";

export const dynamic = "force-dynamic";

type Tone = "green" | "forest" | "emotion" | "neutral" | "danger";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
  access: "all" | "moderation" | "engineering" | "root";
};

type GovernanceSignal = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function toneClasses(tone: Tone): string {
  if (tone === "green") {
    return "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]";
  }

  if (tone === "forest") {
    return "border-[#183A2E]/20 bg-[#183A2E]/10 text-[#183A2E] dark:text-[#BDE8D7]";
  }

  if (tone === "emotion") {
    return "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]";
  }

  if (tone === "danger") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300";
  }

  return "border-[#E0DDD6] bg-white/35 text-[#666666] dark:border-[#2A2A2A] dark:bg-white/[0.04] dark:text-[#8A8A8A]";
}

function translucentCardClass(extra = ""): string {
  return cx(
    "rounded-[30px] border border-[#E0DDD6]/75 bg-white/[0.34] shadow-[0_18px_55px_rgba(17,17,17,0.045)]",
    "dark:border-[#2A2A2A] dark:bg-white/[0.035]",
    extra,
  );
}

function metricIcon(label: string): LucideIcon {
  if (label.includes("Perfis")) return UsersRound;
  if (label.includes("Organizações")) return Building2;
  if (label.includes("Solicitações")) return ClipboardCheck;
  if (label.includes("Flora")) return Sprout;
  return ShieldCheck;
}

function metricTone(metric: DashboardMetric): Tone {
  if (metric.state === "warning") return "emotion";
  if (metric.state === "restricted") return "neutral";
  return "green";
}

function formatAccountNumber(value: number | null): string {
  if (typeof value !== "number") return "—";
  return value.toString().padStart(6, "0");
}

function getDisplayName(context: AdminLayoutContext): string {
  return context.profile.fullName ?? context.ecosystemProfile?.displayName ?? context.user.email.split("@")[0] ?? "Administrador IRÍS";
}

function getVisibleQuickActions(context: AdminLayoutContext): QuickAction[] {
  const actions: QuickAction[] = [
    {
      title: "Solicitações",
      description: "Revisar vínculos institucionais pendentes.",
      href: "/dashboard/organizations/requests",
      icon: ClipboardCheck,
      tone: "emotion",
      access: "moderation",
    },
    {
      title: "Organizações",
      description: "Consultar empresas, membros e diretórios B2B.",
      href: "/dashboard/organizations",
      icon: Building2,
      tone: "green",
      access: "moderation",
    },
    {
      title: "Identidades Flora",
      description: "Gerenciar assinaturas e governança botânica.",
      href: "/dashboard/flora/identities",
      icon: Sprout,
      tone: "forest",
      access: "root",
    },
    {
      title: "Chaves internas",
      description: "Criar e revogar acessos elevados com segurança.",
      href: "/dashboard/flora/creation-keys",
      icon: KeyRound,
      tone: "green",
      access: "root",
    },
    {
      title: "Feature Flags",
      description: "Controlar módulos, rotas e experimentos.",
      href: "/dashboard/feature-flags/modules",
      icon: Flag,
      tone: "emotion",
      access: "engineering",
    },
    {
      title: "Changelog",
      description: "Ver migrations e decisões operacionais.",
      href: "/dashboard/docs/changelog",
      icon: GitBranch,
      tone: "neutral",
      access: "engineering",
    },
  ];

  return actions.filter((action) => {
    if (action.access === "all") return true;
    if (action.access === "moderation") return context.access.isModerator;
    if (action.access === "engineering") return context.access.isEngineering;
    if (action.access === "root") return context.access.isRootGovernance;
    return false;
  });
}

function MetricCard({ metric, index }: { metric: DashboardMetric; index: number }) {
  const Icon = metricIcon(metric.label);
  const tone = metricTone(metric);

  const spanClass =
    index === 0
      ? "md:col-span-3 xl:col-span-4"
      : index === 1
        ? "md:col-span-3 xl:col-span-3"
        : index === 2
          ? "md:col-span-2 xl:col-span-3"
          : "md:col-span-2 xl:col-span-2";

  return (
    <article
      className={cx(
        translucentCardClass("group min-h-[176px] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#006D4E]/25 hover:bg-white/[0.46] motion-reduce:transition-none dark:hover:bg-white/[0.055]"),
        spanClass,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cx("grid size-11 place-items-center rounded-2xl border", toneClasses(tone))}>
          <Icon className="size-5" strokeWidth={1.75} />
        </div>

        {metric.state === "restricted" ? (
          <LockKeyhole className="size-4 text-[#8A8A8A]" />
        ) : (
          <ArrowRight className="size-4 text-[#8A8A8A] transition group-hover:translate-x-0.5 group-hover:text-[#006D4E] motion-reduce:transition-none" />
        )}
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#8A8A8A]">{metric.label}</p>
      <strong className="mt-1 block text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">{metric.value}</strong>
      <p className="mt-3 max-w-sm text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">{metric.description}</p>
    </article>
  );
}

function QuickActionCard({ action, featured = false }: { action: QuickAction; featured?: boolean }) {
  const Icon = action.icon;

  return (
    <Link
      href={action.href}
      className={cx(
        translucentCardClass("group flex flex-col justify-between p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#006D4E]/25 hover:bg-white/[0.46] motion-reduce:transition-none dark:hover:bg-white/[0.055]"),
        featured ? "min-h-[260px] md:col-span-2" : "min-h-[176px]",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className={cx("grid size-11 place-items-center rounded-2xl border", toneClasses(action.tone))}>
            <Icon className="size-5" strokeWidth={1.75} />
          </div>

          <ArrowRight className="size-4 text-[#8A8A8A] transition group-hover:translate-x-0.5 group-hover:text-[#006D4E] motion-reduce:transition-none" />
        </div>

        <h3 className="mt-5 text-base font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">{action.title}</h3>
        <p className="mt-2 text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">{action.description}</p>
      </div>

      {featured && (
        <div className="mt-6 rounded-2xl border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-3 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
          <p className="text-[11px] font-medium text-[#666666] dark:text-[#8A8A8A]">
            Atalho prioritário para manter o fluxo administrativo sem abrir menus profundos.
          </p>
        </div>
      )}
    </Link>
  );
}

function GovernanceSignalCard({ signal, className = "" }: { signal: GovernanceSignal; className?: string }) {
  const Icon = signal.icon;

  return (
    <article className={cx(translucentCardClass("p-5"), className)}>
      <div className="flex items-start justify-between gap-4">
        <div className={cx("grid size-10 place-items-center rounded-2xl border", toneClasses(signal.tone))}>
          <Icon className="size-4" strokeWidth={1.75} />
        </div>

        <p className="rounded-full border border-[#E0DDD6]/70 bg-white/35 px-2.5 py-1 text-[10px] font-medium text-[#666666] dark:border-[#2A2A2A] dark:bg-white/[0.035] dark:text-[#8A8A8A]">
          {signal.label}
        </p>
      </div>

      <strong className="mt-5 block text-lg font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">{signal.value}</strong>
      <p className="mt-2 text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">{signal.description}</p>
    </article>
  );
}

function IdentityPanel({ context }: { context: AdminLayoutContext }) {
  const accountNumber = formatAccountNumber(context.identity.accountNumber);
  const rootLabel = context.access.isRootGovernance ? "Root Governance" : context.access.isEngineering ? "Engenharia" : context.access.isModerator ? "Moderação" : "Admin";

  return (
    <section className={translucentCardClass("min-h-[340px] p-6 md:col-span-5 xl:col-span-4")}>
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-12 place-items-center rounded-2xl border border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]">
          <Fingerprint className="size-5" strokeWidth={1.75} />
        </div>

        <span className="rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1 text-[11px] font-medium text-[#006D4E]">
          {rootLabel}
        </span>
      </div>

      <div className="mt-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666666] dark:text-[#8A8A8A]">Identidade ativa</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">
          {context.identity.speciesCode ?? "IRIS"} / {context.identity.stageCode ?? "—"}
        </h2>
        <p className="mt-3 break-words font-mono text-[11px] leading-6 text-[#444444] dark:text-[#C0C0C0]">
          {context.identity.diagnosticCode ?? "Identidade botânica pendente"}
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-3 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#8A8A8A]">Conta</p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">
            {context.identity.accountPrefix ?? "IRS"}/{accountNumber}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-3 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#8A8A8A]">Região</p>
          <p className="mt-1 font-mono text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">
            {context.identity.regionCode ?? "NA"} / {context.identity.countryCode ?? "BRA"}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[#9A7CA7]/20 bg-[#9A7CA7]/10 p-4 text-[#6F557A] dark:text-[#D7BEDF]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Regra crítica</p>
        <p className="mt-2 text-[13px] leading-6">
          Governança define permissões administrativas, mas não concede leitura de conteúdo íntimo, E2EE ou Zero-Knowledge.
        </p>
      </div>
    </section>
  );
}

function FlowMapCard() {
  const steps = [
    { label: "Sessão", value: "Supabase SSR", icon: ShieldCheck },
    { label: "Perfil", value: "admin_profiles", icon: BadgeCheck },
    { label: "Flora", value: "botanic_identities", icon: Sprout },
    { label: "Acesso", value: "navegação filtrada", icon: Route },
  ];

  return (
    <section className={translucentCardClass("p-5 md:col-span-7 xl:col-span-8")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006D4E]">Protocolo de entrada</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">Admin renderizado por confiança server-first</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">
            O painel não nasce de flags do cliente. A interface é montada depois da sessão, perfil administrativo e identidade Flora serem resolvidos.
          </p>
        </div>

        <div className="grid size-12 place-items-center rounded-2xl border border-[#183A2E]/20 bg-[#183A2E]/10 text-[#183A2E] dark:text-[#BDE8D7]">
          <Network className="size-5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.label} className="relative rounded-[22px] border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-4 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
              <div className="flex items-center justify-between gap-3">
                <div className="grid size-9 place-items-center rounded-xl border border-[#006D4E]/15 bg-[#006D4E]/10 text-[#006D4E]">
                  <Icon className="size-4" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] text-[#8A8A8A]">0{index + 1}</span>
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666666] dark:text-[#8A8A8A]">{step.label}</p>
              <p className="mt-1 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{step.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ActivityRail({ context }: { context: AdminLayoutContext }) {
  const items = [
    {
      title: "Solicitações institucionais",
      description: context.pendingAlerts > 0 ? `${context.pendingAlerts} aguardando revisão.` : "Nenhuma pendência crítica no momento.",
      icon: Bell,
      tone: context.pendingAlerts > 0 ? "emotion" : "green",
    },
    {
      title: "Sessão segura",
      description: context.access.isRootGovernance ? "Contexto Root validado no servidor." : "Contexto administrativo validado no servidor.",
      icon: ShieldCheck,
      tone: "green",
    },
    {
      title: "Documentação",
      description: "Arquitetura, Design System e migrations acessíveis no menu.",
      icon: BookOpen,
      tone: "neutral",
    },
  ] satisfies GovernanceSignal[];

  return (
    <section className={translucentCardClass("p-5 xl:col-span-4")}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006D4E]">Agora</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">Centro de atenção</h2>
        </div>
        <div className="grid size-11 place-items-center rounded-2xl border border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]">
          <Orbit className="size-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="flex gap-3 rounded-[22px] border border-[#E0DDD6]/70 bg-[#FAF7F2]/50 p-3 dark:border-[#2A2A2A] dark:bg-[#111111]/40">
              <div className={cx("grid size-9 shrink-0 place-items-center rounded-xl border", toneClasses(item.tone))}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{item.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#666666] dark:text-[#8A8A8A]">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
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
  const displayName = getDisplayName(context);
  const quickActions = getVisibleQuickActions(context);

  const governanceSignals: GovernanceSignal[] = [
    {
      label: "Privacidade",
      value: "Zero-Knowledge preservado",
      description: "Administração não significa leitura de conteúdo íntimo criptografado.",
      icon: LockKeyhole,
      tone: "forest",
    },
    {
      label: "Operação",
      value: "Fluxo institucional ativo",
      description: "Organizações, solicitações e códigos ficam separados por trilhas auditáveis.",
      icon: Building2,
      tone: "green",
    },
    {
      label: "Qualidade",
      value: "Tempo Bem Gasto",
      description: "O painel prioriza sinais operacionais úteis, não métricas de vaidade.",
      icon: Waves,
      tone: "emotion",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-12">
        <article className={translucentCardClass("relative min-h-[360px] overflow-hidden p-6 sm:p-8 xl:col-span-8")}>
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-[#006D4E]/10 blur-3xl" />
          <div className="absolute -bottom-28 left-12 size-72 rounded-full bg-[#9A7CA7]/10 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-[11px] font-medium text-[#006D4E]">
                <Sparkles className="size-3.5" />
                {context.access.label}
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[#111111] dark:text-[#FAF7F2] sm:text-5xl">
                Centro administrativo do ecossistema IRÍS.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">
                Bem-vindo, {displayName}. Controle identidade, instituições, moderação, documentação e segurança em uma visão limpa, rápida e sem ruído operacional.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-4 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#8A8A8A]">Escopo</p>
                <p className="mt-1 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{context.profile.accountScope ?? "internal"}</p>
              </div>

              <div className="rounded-[22px] border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-4 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#8A8A8A]">Time</p>
                <p className="mt-1 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{context.profile.internalTeam ?? "ecosystem"}</p>
              </div>

              <div className="rounded-[22px] border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-4 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#666666] dark:text-[#8A8A8A]">Status</p>
                <p className="mt-1 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{context.identity.identityStatus === "active" ? "ativo" : "revisar"}</p>
              </div>
            </div>
          </div>
        </article>

        <IdentityPanel context={context} />
      </section>

      <section className="grid gap-4 md:grid-cols-6 xl:grid-cols-12">
        {snapshot.metrics.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} index={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <FlowMapCard />
        <ActivityRail context={context} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.slice(0, 5).map((action, index) => (
          <QuickActionCard key={action.href} action={action} featured={index === 0} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {governanceSignals.map((signal) => (
          <GovernanceSignalCard key={signal.label} signal={signal} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article className={translucentCardClass("p-5 xl:col-span-7")}>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006D4E]">Engenharia</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">Rotas preparadas para telas reais</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">
                Os cards e atalhos já apontam para as áreas do Admin. Cada rota pode evoluir para Server Components específicos sem alterar a estrutura principal.
              </p>
            </div>

            <div className="grid size-12 place-items-center rounded-2xl border border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]">
              <TerminalSquare className="size-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Feature Flags", icon: Flag, href: "/dashboard/feature-flags/modules" },
              { label: "Kill Switches", icon: Wrench, href: "/dashboard/feature-flags/kill-switches" },
              { label: "Design System", icon: Palette, href: "/dashboard/docs/design-system" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-[22px] border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-4 transition hover:border-[#006D4E]/25 hover:bg-white/45 dark:border-[#2A2A2A] dark:bg-[#111111]/45 dark:hover:bg-white/[0.04]"
                >
                  <Icon className="size-4 text-[#006D4E]" />
                  <p className="mt-3 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{item.label}</p>
                  <p className="mt-1 text-[11px] text-[#666666] dark:text-[#8A8A8A]">Abrir área</p>
                </Link>
              );
            })}
          </div>
        </article>

        <article className={translucentCardClass("p-5 xl:col-span-5")}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006D4E]">Checklist vivo</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">Próximas prioridades</h2>
            </div>

            <div className="grid size-11 place-items-center rounded-2xl border border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]">
              <Layers3 className="size-5" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              "Tela real de solicitações institucionais",
              "Painel Root para chaves internas",
              "Auditoria visual do Motor Flora",
              "Feature flags com histórico de alteração",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 px-3 py-2.5 dark:border-[#2A2A2A] dark:bg-[#111111]/45">
                <CheckCircle2 className="size-4 shrink-0 text-[#006D4E]" />
                <p className="text-[13px] leading-5 text-[#444444] dark:text-[#C0C0C0]">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}