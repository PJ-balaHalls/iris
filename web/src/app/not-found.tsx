// web/src/app/not-found.tsx
import Link from "next/link";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export default function NotFoundPage() {
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

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="font-mono text-detail uppercase tracking-[0.24em] text-foreground-muted">
              Página não encontrada
            </p>

            <h1 className="mt-5 max-w-3xl font-serif text-[3.5rem] font-semibold leading-[0.95] tracking-[-0.06em] text-foreground md:text-[5rem]">
              Este caminho não existe no IRÍS.
            </h1>

            <p className="mt-7 max-w-xl text-lead text-foreground-secondary">
              A rota acessada pode ter sido movida, ainda não foi criada ou não
              está disponível para o seu nível de acesso.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/" size="lg">
                <Home className="size-4" aria-hidden="true" />
                Ir para início
              </ButtonLink>

              <ButtonLink href="/login" variant="outline" size="lg">
                Acessar painel admin
              </ButtonLink>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface/92 p-6 shadow-irisLg backdrop-blur">
            <div className="flex size-14 items-center justify-center rounded-full bg-emotion text-white">
              <SearchX className="size-6" aria-hidden="true" />
            </div>

            <h2 className="mt-6 font-serif text-h2 font-semibold tracking-[-0.04em] text-foreground">
              Nada foi perdido.
            </h2>

            <p className="mt-4 text-sm leading-6 text-foreground-secondary">
              A navegação do admin será construída por etapas. Se você esperava
              uma página específica, ela provavelmente ainda não foi aprovada no
              fluxo de desenvolvimento.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-background p-4">
              <p className="font-mono text-detail uppercase tracking-[0.2em] text-foreground-muted">
                Código
              </p>
              <p className="mt-2 text-sm text-foreground-secondary">
                404 / Not Found
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
