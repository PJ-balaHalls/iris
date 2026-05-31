// web/src/components/sections/marketing-docs.tsx
import { ArrowRight, BookOpen, Code, FileText } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function MarketingDocs() {
  return (
    <section className="mx-auto flex w-full max-w-[var(--layout-page-max)] flex-col px-6 pb-16 pt-16 md:px-10 md:pb-24">
      <div className="grid flex-1 items-center gap-12 md:grid-cols-[0.94fr_1.06fr]">
        <div className="max-w-3xl md:order-last">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm text-foreground-secondary shadow-irisSm backdrop-blur">
            <BookOpen className="size-4 text-accent" aria-hidden="true" />
            Guias, API e Manuais.
          </div>

          <h2 className="text-[2.5rem] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground md:text-[4rem]">
            Acesso à documentação.
          </h2>

          <p className="mt-7 max-w-2xl text-lead text-foreground-secondary">
            Explore nossas decisões arquiteturais, guias de integração e diretrizes operacionais. Um acervo projetado para desenvolvedores e parceiros do ecossistema IRÍS.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/docs" size="lg">
              Ler documentação
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>

        <aside
          className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur md:p-6"
          aria-label="Destaques da Documentação"
        >
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                <Code className="size-5" aria-hidden="true" />
              </span>

              <div>
                <h3 className="text-h3 font-semibold tracking-[-0.04em] text-foreground">
                  Referências Técnicas
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                  Consulte os contratos de API, schemas de banco de dados e as definições de arquitetura do Motor Flora.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background p-5">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emotion text-white">
                <FileText className="size-5" aria-hidden="true" />
              </span>

              <div>
                <h3 className="text-h3 font-semibold tracking-[-0.04em] text-foreground">
                  Guias Operacionais
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                  Documentação focada em regras de negócio, onboarding e fluxos de suporte dentro do painel de administração.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 border-t border-border pt-5">
            <p className="text-detail font-medium uppercase tracking-[0.22em] text-foreground-muted">
              Público & Transparente
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground-secondary">
              Mantenha-se atualizado sobre as versões, changelogs e recursos do sistema na nossa página pública de docs.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}