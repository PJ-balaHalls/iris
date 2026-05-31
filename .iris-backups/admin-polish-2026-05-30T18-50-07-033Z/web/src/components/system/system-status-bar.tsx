// web/src/components/system/system-status-bar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type HealthSeverity = "success" | "warning" | "error";

type HealthItem = {
  key: string;
  label: string;
  ok: boolean;
  severity: HealthSeverity;
  detail: string;
};

type HealthPayload = {
  ok: boolean;
  checkedAt: string;
  environment: string;
  items: HealthItem[];
};

function getSeverityClasses(severity: HealthSeverity) {
  if (severity === "success") return "text-success";
  if (severity === "warning") return "text-emotion";
  return "text-danger";
}

function StatusIcon({ severity }: { severity: HealthSeverity }) {
  if (severity === "success") {
    return <CheckCircle2 className="size-3.5" aria-hidden="true" />;
  }

  if (severity === "warning") {
    return <AlertTriangle className="size-3.5" aria-hidden="true" />;
  }

  return <XCircle className="size-3.5" aria-hidden="true" />;
}

export function SystemStatusBar() {
  const [status, setStatus] = useState<HealthPayload | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadStatus() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/system/status", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Status API unavailable");
      }

      const payload = (await response.json()) as HealthPayload;
      setStatus(payload);
    } catch {
      setStatus({
        ok: false,
        checkedAt: new Date().toISOString(),
        environment: "development",
        items: [
          {
            key: "status_api",
            label: "Status API",
            ok: false,
            severity: "error",
            detail: "Não foi possível carregar a API de status.",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();

    const interval = window.setInterval(() => {
      void loadStatus();
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const mainSeverity: HealthSeverity = useMemo(() => {
    if (!status) return "warning";
    if (status.items.some((item) => item.severity === "error")) return "error";
    if (status.items.some((item) => item.severity === "warning")) return "warning";
    return "success";
  }, [status]);

  const summary = useMemo(() => {
    if (isLoading && !status) return "Verificando sistema...";
    if (!status) return "Status indisponível";

    const errors = status.items.filter((item) => item.severity === "error").length;
    const warnings = status.items.filter((item) => item.severity === "warning").length;

    if (errors > 0) return `${errors} erro(s)`;
    if (warnings > 0) return `${warnings} aviso(s)`;
    return "Ambiente conectado";
  }, [isLoading, status]);

  return (
    <div className="sticky top-0 z-[9999] border-b border-border bg-surface/95 text-foreground shadow-irisSm backdrop-blur">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="mx-auto flex h-8 w-full max-w-[var(--layout-page-max)] items-center justify-between px-4 text-left text-[0.72rem] md:px-8"
      >
        <span className="flex items-center gap-2">
          {isLoading ? (
            <Loader2
              className="size-3.5 animate-spin text-foreground-muted"
              aria-hidden="true"
            />
          ) : (
            <span className={cn("flex items-center", getSeverityClasses(mainSeverity))}>
              <StatusIcon severity={mainSeverity} />
            </span>
          )}

          <span className="font-mono uppercase tracking-[0.18em] text-foreground-muted">
            IRÍS System
          </span>

          <span className={cn("font-medium", getSeverityClasses(mainSeverity))}>
            {summary}
          </span>
        </span>

        <span className="flex items-center gap-2 text-foreground-muted">
          <span className="hidden sm:inline">
            {status?.checkedAt
              ? new Intl.DateTimeFormat("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(status.checkedAt))
              : "aguardando"}
          </span>

          <ChevronDown
            className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-border bg-background/98">
          <div className="mx-auto grid max-w-[var(--layout-page-max)] gap-2 px-4 py-3 md:grid-cols-5 md:px-8">
            {status?.items.map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-border bg-surface px-3 py-2 shadow-irisSm"
              >
                <div className="flex items-center gap-2">
                  <span className={cn("flex items-center", getSeverityClasses(item.severity))}>
                    <StatusIcon severity={item.severity} />
                  </span>

                  <p className="text-xs font-medium text-foreground">
                    {item.label}
                  </p>
                </div>

                <p className="mt-1 text-[0.7rem] leading-5 text-foreground-muted">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
