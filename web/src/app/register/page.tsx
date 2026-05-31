// web/src/app/register/page.tsx
import Link from "next/link";
import { ArrowLeft, Building2, ShieldCheck, UserRound } from "lucide-react";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function RegisterPage() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1280px] flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground-secondary shadow-irisSm transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Login
          </Link>

          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-border bg-surface shadow-irisSm">
              <span className="size-2 rounded-full bg-accent" />
            </span>
            <span className="font-serif text-lg tracking-[-0.03em] text-foreground">
              IRÍS
            </span>
          </div>
        </header>

        <section className="grid flex-1 items-start gap-8 py-10 lg:grid-cols-[0.34fr_0.66fr] xl:gap-12">
          <aside className="lg:sticky lg:top-16">
            <p className="font-mono text-detail uppercase tracking-[0.24em] text-foreground-muted">
              Register / Onboarding
            </p>

            <h1 className="mt-5 max-w-xl font-serif text-[3.6rem] font-semibold leading-[0.95] tracking-[-0.06em] text-foreground xl:text-[4.2rem]">
              Acesso com contexto.
            </h1>

            <p className="mt-7 max-w-lg text-lead text-foreground-secondary">
              O IRÍS Admin identifica domínio, função, time e tipo de conta para liberar uma
              experiência proporcional à responsabilidade de cada usuário.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
                <UserRound className="mb-4 size-5 text-accent" aria-hidden="true" />
                <h2 className="font-serif text-h3 text-foreground">Internos</h2>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                  Domínio @iris.com libera função, time, dashboards e permissões internas.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
                <Building2 className="mb-4 size-5 text-emotion" aria-hidden="true" />
                <h2 className="font-serif text-h3 text-foreground">Externos</h2>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                  Parceiros, clientes e fornecedores recebem fluxo adaptado e termos específicos.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
                <ShieldCheck className="mb-4 size-5 text-accent" aria-hidden="true" />
                <h2 className="font-serif text-h3 text-foreground">Retomável</h2>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                  O progresso não sensível é salvo localmente e preparado para retomada.
                </p>
              </div>
            </div>
          </aside>

          <div className="w-full">
            <div className="rounded-[2rem] border border-border bg-surface/92 p-5 shadow-irisLg backdrop-blur md:p-8 xl:p-10">
              <OnboardingWizard />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
