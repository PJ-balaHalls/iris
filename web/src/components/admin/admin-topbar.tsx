// /web/src/components/admin/admin-topbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Search, ShieldCheck } from "lucide-react";
import { findAdminNavigationItem } from "@/constants/admin-navigation";
import type { AdminNavigationGroup } from "@/constants/admin-navigation";
import type { AdminLayoutContext } from "@/types/admin";

type AdminTopbarProps = {
  currentAdmin: AdminLayoutContext;
  groups: AdminNavigationGroup[];
  pendingAlerts: number;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
};

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Admin",
  ecosystem: "Ecossistema",
  profiles: "Perfis Globais",
  health: "Saúde",
  organizations: "Organizações",
  requests: "Solicitações",
  "access-codes": "Códigos",
  flora: "Motor Flora",
  identities: "Identidades",
  taxonomy: "Taxonomia",
  "creation-keys": "Chaves de Criação",
  audit: "Auditoria",
  moderation: "Moderação",
  ethics: "Comitê de Ética",
  "content-retention": "Conteúdo & Retenção",
  councils: "Conselhos",
  "feature-flags": "Feature Flags",
  modules: "Módulos",
  "kill-switches": "Kill Switches",
  experiments: "Experimentos",
  docs: "Documentação",
  architecture: "Arquitetura",
  "design-system": "Design System",
  "moderation-guides": "Guias",
  changelog: "Changelog",
};

function formatSegment(segment: string): string {
  return BREADCRUMB_LABELS[segment] ?? segment.replace(/-/g, " ").replace(/^\w/, (match) => match.toUpperCase());
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label: formatSegment(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
    current: index === segments.length - 1,
  }));
}

export function AdminTopbar({ currentAdmin, groups, pendingAlerts, collapsed, setCollapsed, setMobileOpen }: AdminTopbarProps) {
  const pathname = usePathname();
  const breadcrumbs = React.useMemo(() => buildBreadcrumbs(pathname), [pathname]);
  const activeItem = React.useMemo(() => findAdminNavigationItem(pathname, groups), [pathname, groups]);

  return (
    <div className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-8">
      <header className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 rounded-[30px] border border-[#E0DDD6]/70 bg-white/[0.58] px-3 py-2 shadow-[0_16px_55px_rgba(17,17,17,0.055)] backdrop-blur-3xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/[0.58] sm:px-4">
        <button
          type="button"
          aria-label="Abrir navegação administrativa"
          className="grid size-10 place-items-center rounded-full border border-[#E0DDD6]/70 bg-[#FAF7F2]/60 text-[#444444] transition hover:text-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#111111]/55 dark:text-[#C0C0C0] lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-4" />
        </button>

        <button
          type="button"
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          className="hidden size-10 place-items-center rounded-full border border-[#E0DDD6]/70 bg-[#FAF7F2]/60 text-[#444444] transition hover:text-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#111111]/55 dark:text-[#C0C0C0] lg:grid"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu className="size-4" />
        </button>

        <div className="hidden h-8 w-px bg-[#E0DDD6]/80 dark:bg-[#2A2A2A] sm:block" />

        <div className="min-w-0 flex-1">
          <nav className="hidden items-center gap-1 overflow-hidden text-[11px] text-[#666666] dark:text-[#8A8A8A] sm:flex" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {crumb.current ? (
                  <span className="truncate font-medium text-[#111111] dark:text-[#FAF7F2]">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="truncate transition hover:text-[#006D4E]">
                    {crumb.label}
                  </Link>
                )}

                {index < breadcrumbs.length - 1 && <ChevronRight className="size-3.5 shrink-0 text-[#8A8A8A]" />}
              </React.Fragment>
            ))}
          </nav>

          <p className="truncate text-[13px] font-semibold text-[#111111] dark:text-[#FAF7F2] sm:mt-0.5">
            {activeItem?.title ?? "Admin IRÍS"}
          </p>
        </div>

        <form className="relative hidden w-56 items-center text-[#666666] md:flex lg:w-72" role="search" onSubmit={(event) => event.preventDefault()}>
          <Search className="pointer-events-none absolute left-3.5 size-4" strokeWidth={1.75} />
          <input
            type="search"
            aria-label="Busca global administrativa"
            placeholder="Buscar username, CNPJ, código..."
            className="h-10 w-full rounded-full border border-[#E0DDD6]/70 bg-[#FAF7F2]/60 pl-10 pr-4 text-[13px] outline-none transition placeholder:text-[#8A8A8A] focus:border-[#006D4E]/45 focus:bg-white/80 focus:ring-4 focus:ring-[#006D4E]/10 dark:border-[#2A2A2A] dark:bg-[#111111]/55 dark:text-[#FAF7F2] dark:focus:bg-[#111111]/75"
          />
        </form>

        <div className="hidden items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/[0.075] px-3 py-2 text-[11px] font-medium text-[#006D4E] xl:flex">
          <ShieldCheck className="size-3.5" />
          <span>{currentAdmin.access.isRootGovernance ? "Root SSR" : "SSR seguro"}</span>
        </div>

        <Link
          href="/dashboard/organizations/requests"
          aria-label={pendingAlerts + " notificações administrativas pendentes"}
          className="relative grid size-10 place-items-center rounded-full border border-[#E0DDD6]/70 bg-[#FAF7F2]/60 text-[#444444] transition hover:text-[#006D4E] dark:border-[#2A2A2A] dark:bg-[#111111]/55 dark:text-[#C0C0C0]"
        >
          <Bell className="size-4" />

          {pendingAlerts > 0 && (
            <span className="absolute right-2 top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#006D4E] px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white dark:ring-[#1C1C1C]">
              {pendingAlerts > 9 ? "9+" : pendingAlerts}
            </span>
          )}
        </Link>
      </header>
    </div>
  );
}
