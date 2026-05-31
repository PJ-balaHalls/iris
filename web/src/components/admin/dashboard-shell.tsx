// web/src/components/admin/dashboard-shell.tsx
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export type AdminDashboardProfile = {
  email: string;
  fullName: string | null;
  username: string | null;
  accountScope: "internal" | "external";
  internalRole: string | null;
  internalTeam: string | null;
  externalAccountType: string | null;
};

type DashboardShellProps = Readonly<{
  profile: AdminDashboardProfile;
}>;

function getDisplayName(profile: AdminDashboardProfile) {
  return profile.fullName?.trim() || profile.username || profile.email;
}

function getScopeLabel(profile: AdminDashboardProfile) {
  if (profile.accountScope === "internal") {
    return "Conta interna";
  }

  return "Conta externa";
}

export function DashboardShell({ profile }: DashboardShellProps) {
  const displayName = getDisplayName(profile);

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[var(--layout-page-max)]">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-border bg-surface/88 p-5 shadow-irisLg backdrop-blur md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
              Dashboard Admin
            </p>

            <h1 className="mt-3 text-h2 font-semibold tracking-[-0.05em] text-foreground">
              Bem-vindo, {displayName}.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
              A sessão foi validada no servidor, o perfil administrativo foi carregado com RLS
              e o acesso foi direcionado para uma área protegida.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground-secondary">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              Sessão ativa
            </span>

            <ButtonLink href="/logout" variant="outline" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </ButtonLink>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
            <UserRound className="mb-4 size-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
              Identidade
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              {profile.username ? `@${profile.username}` : profile.email}
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
            <ShieldCheck className="mb-4 size-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
              Escopo
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              {getScopeLabel(profile)}
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
            <Building2 className="mb-4 size-5 text-emotion" aria-hidden="true" />
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
              Contexto
            </h2>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              {profile.accountScope === "internal"
                ? profile.internalTeam || "Time interno não definido"
                : profile.externalAccountType || "Relação externa não definida"}
            </p>
          </article>
        </section>

        <section className="mt-6 rounded-[2rem] border border-border bg-surface/88 p-6 shadow-irisMd backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[0.68fr_0.32fr] lg:items-center">
            <div>
              <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
                Próxima camada
              </p>

              <h2 className="mt-3 text-h3 font-semibold tracking-[-0.04em] text-foreground">
                Agora podemos construir a navegação privada do Admin.
              </h2>

              <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                A próxima etapa natural é criar sidebar/header privados, RBAC visual,
                tela de perfil, logout com feedback e módulos iniciais do painel.
              </p>
            </div>

            <Link
              href="/settings/profile"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground-secondary shadow-irisSm transition hover:border-accent hover:text-accent"
            >
              Preparar configurações
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
