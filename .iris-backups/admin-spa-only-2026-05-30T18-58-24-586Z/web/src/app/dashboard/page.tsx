// /web/src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  LockKeyhole,
  Network,
  Orbit,
  ShieldCheck,
  Sparkles,
  Sprout,
  UsersRound,
  Waves,
} from "lucide-react";
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
        ? "border-[#E0DDD6]/80 bg-white/45 text-[#666666] dark:border-[#2A2A2A] dark:bg-white/[0.03] dark:text-[#8A8A8A]"
        : "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]";

  return (
    <article className="rounded-[30px] border border-[#E0DDD6]/75 bg-white/[0.62] p-5 shadow-[0_16px_50px_rgba(17,17,17,0.045)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/[0.74] motion-reduce:transition-none dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.62]">
      <div className="flex items-start justify-between gap-4">
        <div className={"grid size-11 place-items-center rounded-2xl border " + stateClass}>
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        {metric.state === "restricted" && <LockKeyhole className="size-4 text-[#8A8A8A]" />}
      </div>

      <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-[#666666] dark:text-[#8A8A8A]">{metric.label}</p>
      <strong className="mt-1 block text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">{metric.value}</strong>
      <p className="mt-3 text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">{metric.description}</p>
    </article>
  );
}

function PrincipleCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
  tone: "green" | "forest" | "emotion";
}) {
  const toneClass =
    tone === "emotion"
      ? "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]"
      : tone === "forest"
        ? "border-[#183A2E]/20 bg-[#183A2E]/10 text-[#183A2E] dark:text-[#BDE8D7]"
        : "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]";

  return (
    <article className="rounded-[28px] border border-[#E0DDD6]/75 bg-white/[0.58] p-5 backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.58]">
      <div className={"grid size-10 place-items-center rounded-2xl border " + toneClass}>
        <Icon className="size-4" />
      </div>
      <h2 className="mt-4 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{title}</h2>
      <p className="mt-2 text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">{text}</p>
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
      <section className="relative overflow-hidden rounded-[38px] border border-[#E0DDD6]/75 bg-white/[0.60] p-6 shadow-[0_20px_70px_rgba(17,17,17,0.055)] backdrop-blur-3xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.60] sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#006D4E]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-16 size-56 rounded-full bg-[#9A7CA7]/12 blur-3xl" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-[11px] font-medium text-[#006D4E]">
              <Sparkles className="size-3.5" />
              {context.access.label}
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2] sm:text-4xl">Painel Administrativo IRÍS</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">
              Bem-vindo, {displayName}. Uma visão operacional calma para governar identidade, instituições, moderação e segurança sem transformar o painel em ruído.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
            <div className="rounded-[26px] border border-[#006D4E]/15 bg-[#006D4E]/[0.075] p-4 text-[#183A2E] dark:text-[#BDE8D7]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#006D4E]">Assinatura Flora</p>
              <p className="mt-2 line-clamp-3 break-words font-mono text-[11px] leading-5">{context.identity.diagnosticCode ?? "Identidade pendente"}</p>
            </div>
            <div className="rounded-[26px] border border-[#9A7CA7]/20 bg-[#9A7CA7]/10 p-4 text-[#6F557A] dark:text-[#D7BEDF]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">Estado</p>
              <p className="mt-2 text-sm font-semibold">{context.identity.identityStatus === "active" ? "Governança ativa" : "Revisar identidade"}</p>
              <p className="mt-1 text-[11px] leading-5">Sessão protegida por Server Component e Supabase SSR.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[32px] border border-[#E0DDD6]/75 bg-white/[0.58] p-5 backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.58] lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006D4E]">Tempo Bem Gasto</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">Operação sem métricas de vaidade</h2>
            </div>
            <div className="grid size-12 place-items-center rounded-2xl border border-[#183A2E]/20 bg-[#183A2E]/10 text-[#183A2E] dark:text-[#BDE8D7]">
              <Waves className="size-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Identidade", "Instituições", "Moderação"].map((item, index) => (
              <div key={item} className="rounded-2xl border border-[#E0DDD6]/65 bg-[#FAF7F2]/55 p-3 dark:border-[#2A2A2A] dark:bg-[#111111]/40">
                <p className="text-[11px] text-[#666666] dark:text-[#8A8A8A]">Camada {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <PrincipleCard
          icon={Network}
          title="SPA administrativa"
          text="A navegação interna exibe skeleton imediato ao clique e mantém a sensação de painel contínuo."
          tone="green"
        />

        <PrincipleCard
          icon={Orbit}
          title="Motor Flora"
          text="Menus e ações continuam derivados do contexto de espécie, estágio e governança."
          tone="emotion"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <PrincipleCard
          icon={ShieldCheck}
          title="Segurança server-first"
          text="O layout valida sessão, admin_profile e botanic_identity no servidor antes de renderizar a interface administrativa."
          tone="green"
        />

        <PrincipleCard
          icon={Sprout}
          title="Governança discreta"
          text="Root Governance orienta permissões, mas não concede leitura de conteúdo íntimo ou criptografado."
          tone="forest"
        />

        <PrincipleCard
          icon={ArrowUpRight}
          title="Próximo bloco"
          text="Agora a base visual está pronta para telas reais: solicitações, chaves internas, auditoria e feature flags."
          tone="emotion"
        />
      </section>
    </div>
  );
}
