// web/src/components/sections/marketing-hero.tsx
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function MarketingHero() {
  return (
    <main>
      <section className="mx-auto flex min-h-[100svh] w-full max-w-[var(--layout-page-max)] flex-col px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-36">
        <div className="grid flex-1 items-center gap-12 md:grid-cols-[1.06fr_0.94fr]">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm text-foreground-secondary shadow-irisSm backdrop-blur">
              <Sparkles className="size-4 text-emotion" aria-hidden="true" />
              Ecossistema privado, editorial e seguro.
            </div>

            <h1 className="text-[3rem] font-semibold leading-[0.95] tracking-[-0.06em] text-foreground md:text-[5.2rem]">
              Gestão silenciosa para um produto vivo.
            </h1>

            <p className="mt-7 max-w-2xl text-lead text-foreground-secondary">
              O painel IRÍS nasce para organizar produto, design, tecnologia,
              parceiros e permissões sem romper a essência do ecossistema:
              privacidade, memória, presença e significado.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login" size="lg">
                Acessar painel admin
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>

              <ButtonLink href="#principios" variant="outline" size="lg">
                Ver princípios
              </ButtonLink>
            </div>
          </div>

          <aside
            id="principios"
            className="scroll-mt-28 rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur md:p-6"
            aria-label="Princípios do painel IRÍS"
          >
            <div className="rounded-xl border border-border bg-background p-5">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>

                <div>
                  <h2 className="text-h3 font-semibold tracking-[-0.04em] text-foreground">
                    Segurança como base
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                    O admin deve respeitar permissões, contexto de usuário e
                    separação entre perfis internos, parceiros e clientes.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background p-5">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emotion text-white">
                  <LockKeyhole className="size-5" aria-hidden="true" />
                </span>

                <div>
                  <h2 className="text-h3 font-semibold tracking-[-0.04em] text-foreground">
                    Acesso intencional
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                    Login, cadastro e onboarding conduzem cada pessoa para uma
                    experiência proporcional ao seu papel no IRÍS.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
                Próxima camada
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                O dashboard deverá nascer em rota privada, sem topbar pública,
                com navegação própria, permissões e sessão protegida.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
