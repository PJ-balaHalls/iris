// web/src/app/login/page.tsx
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[var(--layout-page-max)] flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground-secondary shadow-irisSm transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Voltar
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

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="hidden lg:block">
            <p className="font-mono text-detail uppercase tracking-[0.24em] text-foreground-muted">
              Acesso administrativo
            </p>

            <h1 className="mt-5 max-w-xl font-serif text-[4.4rem] font-semibold leading-[0.95] tracking-[-0.06em] text-foreground">
              Entre com calma. Gerencie com precisão.
            </h1>

            <p className="mt-7 max-w-lg text-lead text-foreground-secondary">
              O admin do IRÍS separa acessos internos, parceiros e clientes
              para preservar segurança, contexto e responsabilidade operacional.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>

                <div>
                  <h2 className="font-serif text-h3 text-foreground">
                    Sessão protegida
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                    O acesso será conectado ao Supabase Auth e depois ao
                    onboarding de permissões por domínio, função, time e tipo de
                    conta.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="mx-auto w-full max-w-[28rem]">
            <div className="rounded-2xl border border-border bg-surface/92 p-6 shadow-irisLg backdrop-blur md:p-8">
              <div className="mb-8">
                <p className="font-mono text-detail uppercase tracking-[0.22em] text-foreground-muted">
                  Login
                </p>

                <h2 className="mt-3 font-serif text-h2 font-semibold tracking-[-0.04em] text-foreground">
                  Acessar painel admin
                </h2>

                <p className="mt-3 text-sm leading-6 text-foreground-secondary">
                  Use seu e-mail e senha para continuar. Contas novas seguem
                  para o cadastro e onboarding.
                </p>
              </div>

              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
