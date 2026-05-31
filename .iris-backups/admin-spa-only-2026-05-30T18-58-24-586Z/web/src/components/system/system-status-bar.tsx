// /web/src/components/system/system-status-bar.tsx
"use client";

import * as React from "react";
import { CheckCircle2, EyeOff, RefreshCw, Server, ShieldAlert, XCircle } from "lucide-react";

type SystemStatusState = "idle" | "checking" | "healthy" | "warning" | "error";

type SystemStatusPayload = {
  status?: string;
  ok?: boolean;
  checks?: Record<string, boolean | string | number | null>;
  timestamp?: string;
};

const STORAGE_KEY = "iris.system.statusBar.hidden";

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function getStateFromPayload(payload: SystemStatusPayload | null): SystemStatusState {
  if (!payload) return "idle";
  if (payload.ok === true || payload.status === "ok" || payload.status === "healthy") return "healthy";
  if (payload.status === "warning") return "warning";
  return "error";
}

function StatusIcon({ state }: { state: SystemStatusState }) {
  if (state === "checking") return <RefreshCw className="size-3.5 animate-spin motion-reduce:animate-none" />;
  if (state === "healthy") return <CheckCircle2 className="size-3.5" />;
  if (state === "error") return <XCircle className="size-3.5" />;
  if (state === "warning") return <ShieldAlert className="size-3.5" />;
  return <Server className="size-3.5" />;
}

export function SystemStatusBar() {
  const [hidden, setHidden] = React.useState(false);
  const [state, setState] = React.useState<SystemStatusState>("idle");
  const [payload, setPayload] = React.useState<SystemStatusPayload | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      setHidden(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setHidden(false);
    }
  }, []);

  async function checkStatus() {
    setState("checking");

    try {
      const response = await fetch("/api/system/status", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const json = (await response.json().catch(() => null)) as SystemStatusPayload | null;

      if (!response.ok) {
        setPayload(json);
        setState("error");
        setLastCheckedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
        return;
      }

      setPayload(json);
      setState(getStateFromPayload(json));
      setLastCheckedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setPayload(null);
      setState("error");
      setLastCheckedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }
  }

  function hideStatusBar() {
    setHidden(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
  }

  function showStatusBar() {
    setHidden(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "false");
    } catch {}
  }

  if (hidden) {
    return (
      <button
        type="button"
        onClick={showStatusBar}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-[#E0DDD6]/80 bg-white/70 px-3 py-2 text-[11px] font-medium text-[#666666] shadow-[0_10px_30px_rgba(17,17,17,0.08)] backdrop-blur-2xl transition hover:text-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/70 dark:text-[#8A8A8A] dark:hover:text-[#FAF7F2]"
        aria-label="Mostrar status do sistema"
      >
        <Server className="size-3.5" />
        Status
      </button>
    );
  }

  const statusLabel =
    state === "idle"
      ? "Não verificado"
      : state === "checking"
        ? "Verificando"
        : state === "healthy"
          ? "Sistema estável"
          : state === "warning"
            ? "Atenção"
            : "Falha";

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-32px))] rounded-[22px] border border-[#E0DDD6]/80 bg-white/72 p-2.5 shadow-[0_18px_50px_rgba(17,17,17,0.10)] backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/72">
      <div className="flex items-center gap-2">
        <div
          className={cx(
            "grid size-8 shrink-0 place-items-center rounded-full border",
            state === "healthy" && "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]",
            state === "warning" && "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]",
            state === "error" && "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
            (state === "idle" || state === "checking") && "border-[#E0DDD6] bg-[#FAF7F2]/80 text-[#666666] dark:border-[#2A2A2A] dark:bg-[#111111]/70 dark:text-[#8A8A8A]"
          )}
        >
          <StatusIcon state={state} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111111] dark:text-[#FAF7F2]">
            Status do ambiente
          </p>
          <p className="truncate text-[11px] text-[#666666] dark:text-[#8A8A8A]">
            {statusLabel}
            {lastCheckedAt ? " • " + lastCheckedAt : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={checkStatus}
          disabled={state === "checking"}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#E0DDD6] bg-[#FAF7F2]/80 px-2.5 text-[11px] font-medium text-[#444444] transition hover:border-[#006D4E]/35 hover:text-[#006D4E] disabled:cursor-wait disabled:opacity-70 dark:border-[#2A2A2A] dark:bg-[#111111]/70 dark:text-[#C0C0C0]"
        >
          <RefreshCw className={cx("size-3.5", state === "checking" && "animate-spin motion-reduce:animate-none")} />
          Verificar
        </button>

        <button
          type="button"
          onClick={hideStatusBar}
          className="grid size-8 place-items-center rounded-full text-[#8A8A8A] transition hover:bg-[#FAF7F2] hover:text-[#111111] dark:hover:bg-white/[0.05] dark:hover:text-[#FAF7F2]"
          aria-label="Ocultar status do sistema"
        >
          <EyeOff className="size-3.5" />
        </button>
      </div>

      {payload?.checks && (
        <div className="mt-2 grid grid-cols-2 gap-1.5 border-t border-[#E0DDD6]/70 pt-2 dark:border-[#2A2A2A]">
          {Object.entries(payload.checks).slice(0, 4).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-[#FAF7F2]/70 px-2 py-1 text-[10px] text-[#666666] dark:bg-[#111111]/55 dark:text-[#8A8A8A]">
              <span className="font-medium text-[#444444] dark:text-[#C0C0C0]">{key}</span>: {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SystemStatusBar;
