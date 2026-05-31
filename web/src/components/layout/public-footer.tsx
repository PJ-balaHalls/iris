// web/src/components/layout/public-footer.tsx
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  {
    label: "Acesso admin",
    href: "/login"
  },
  {
    label: "IRÍS Kids",
    href: "/kids"
  },
  {
    label: "Princípios",
    href: "/#principios"
  }
] as const;

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-background/70 px-6 py-10 backdrop-blur md:px-10">
      <div className="mx-auto grid w-full max-w-[var(--layout-page-max)] gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface shadow-irisSm">
              <span className="size-2.5 rounded-full bg-accent" />
            </span>

            <div>
              <p className="text-lg font-semibold tracking-[-0.04em] text-foreground">
                IRÍS
              </p>
              <p className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-foreground-muted">
                Admin / Ecossistema
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-xl text-sm leading-6 text-foreground-secondary">
            Um painel administrativo silencioso para organizar produto, segurança,
            permissões e operação sem romper a essência privada do ecossistema.
          </p>

          <p className="mt-5 text-xs leading-5 text-foreground-muted">
            © {year} IRÍS Social. Interface pública mínima, sem ruído e sem exposição
            de informações sensíveis.
          </p>
        </div>

        <nav
          aria-label="Links públicos do rodapé"
          className="flex flex-wrap gap-2 md:justify-end"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground-secondary shadow-irisSm transition hover:border-accent hover:text-accent"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
