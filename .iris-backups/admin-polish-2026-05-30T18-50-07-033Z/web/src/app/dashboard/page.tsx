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
