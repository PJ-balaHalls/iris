// web/src/components/layout/hero-topbar.tsx
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function HeroTopbar() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 md:top-5">
      <nav
        aria-label="Navegação pública do IRÍS"
        className="mx-auto flex h-16 w-full max-w-[min(var(--layout-page-max),calc(100vw-2rem))] items-center justify-between rounded-full border border-border/80 bg-surface/72 px-3 shadow-irisMd backdrop-blur-xl supports-[backdrop-filter]:bg-surface/62 md:px-4"
      >
        <Link
          href="/"
          aria-label="Voltar para a página inicial do IRÍS"
          className="group inline-flex min-w-0 items-center gap-3 rounded-full px-2 py-1.5 transition hover:bg-background/70"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/80 shadow-irisSm">
            <span className="size-2.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
          </span>

          <span className="min-w-0">
            <span className="block text-lg font-semibold leading-none tracking-[-0.04em] text-foreground">
              IRÍS
            </span>
            <span className="mt-1 hidden text-[0.66rem] font-medium uppercase tracking-[0.22em] text-foreground-muted sm:block">
              Admin System
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-background/55 px-3 py-2 text-xs leading-none text-foreground-secondary shadow-irisSm lg:flex">
          <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
          Privacidade, contexto e segurança
        </div>

        <ButtonLink href="/login" variant="secondary" size="sm" className="h-10 px-4">
          Login
          <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </nav>
    </header>
  );
}
