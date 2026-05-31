// web/src/components/system/global-loading.tsx
type GlobalLoadingProps = {
  routePath?: string;
  label?: string;
};

function getRouteLabel(routePath?: string) {
  if (!routePath || routePath === "/") return "Preparando início";
  if (routePath.startsWith("/login")) return "Preparando acesso";
  if (routePath.startsWith("/register")) return "Preparando onboarding";
  if (routePath.startsWith("/dashboard")) return "Preparando painel";
  if (routePath.startsWith("/settings")) return "Preparando configurações";
  return "Preparando rota";
}

export function GlobalLoading({ routePath, label }: GlobalLoadingProps) {
  const displayLabel = label ?? getRouteLabel(routePath);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9000] flex min-h-screen items-center justify-center overflow-hidden bg-background px-6"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(154,124,167,0.14),transparent_26rem),radial-gradient(circle_at_70%_30%,rgba(0,109,78,0.1),transparent_28rem)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface/90 p-8 text-center shadow-irisLg backdrop-blur">
        <span className="sr-only">{displayLabel}</span>

        <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-border bg-background shadow-irisMd">
          <div className="relative size-11">
            <span className="absolute inset-0 rounded-full border border-accent/20" />
            <span className="absolute inset-1 rounded-full border-2 border-transparent border-t-accent motion-safe:animate-spin" />
            <span className="absolute inset-4 rounded-full bg-emotion/70 shadow-irisSm" />
          </div>
        </div>

        <p className="mt-7 text-detail font-medium uppercase tracking-[0.24em] text-foreground-muted">
          IRÍS System
        </p>

        <h1 className="mt-3 text-h3 font-semibold tracking-[-0.04em] text-foreground">
          {displayLabel}
        </h1>

        <p className="mt-3 text-sm leading-6 text-foreground-secondary">
          Carregando interface com segurança, permissões e contexto visual.
        </p>

        <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full w-1/3 rounded-full bg-accent motion-safe:animate-[iris-progress_1.35s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
