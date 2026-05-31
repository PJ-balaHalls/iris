#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const startedAt = new Date();

function exists(p) {
  return fs.existsSync(p);
}

function resolveWebRoot() {
  if (exists(path.join(root, "web", "src", "app"))) return path.join(root, "web");
  if (exists(path.join(root, "src", "app")) && exists(path.join(root, "package.json"))) return root;
  throw new Error("Execute este setup na raiz do monorepo IRIS ou dentro da pasta web.");
}

const webRoot = resolveWebRoot();
const repoRoot = path.basename(webRoot) === "web" ? path.dirname(webRoot) : webRoot;
const backupRoot = path.join(
  repoRoot,
  ".iris-backups",
  "admin-spa-only-" + startedAt.toISOString().replace(/[:.]/g, "-")
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function backupIfNeeded(absPath) {
  if (!exists(absPath)) return;

  const relative = path.relative(repoRoot, absPath);
  const backupPath = path.join(backupRoot, relative);

  ensureDir(path.dirname(backupPath));
  fs.copyFileSync(absPath, backupPath);
}

function writeWebFile(relativePath, content) {
  const absPath = path.join(webRoot, relativePath);
  const normalized = content.trimStart().replace(/\s+$/g, "") + "\n";

  ensureDir(path.dirname(absPath));

  if (exists(absPath)) {
    const current = fs.readFileSync(absPath, "utf8");
    if (current === normalized) {
      console.log("= mantido:", path.relative(repoRoot, absPath));
      return;
    }
    backupIfNeeded(absPath);
  }

  fs.writeFileSync(absPath, normalized, "utf8");
  console.log("+ escrito:", path.relative(repoRoot, absPath));
}

function writeNullLoading(relativePath, label) {
  writeWebFile(relativePath, `
// /web/${relativePath}
export default function ${label}() {
  return null;
}
`);
}

/**
 * 1) Remove qualquer UI de status/loading global.
 * A única percepção de carregamento no Admin passa a ser o skeleton SPA dentro do conteúdo.
 */
writeWebFile("src/components/system/system-status-bar.tsx", `
// /web/src/components/system/system-status-bar.tsx
export function SystemStatusBar() {
  return null;
}

export default SystemStatusBar;
`);

writeWebFile("src/components/system/global-loading.tsx", `
// /web/src/components/system/global-loading.tsx
type GlobalLoadingProps = {
  message?: string;
  fullScreen?: boolean;
  className?: string;
};

export function GlobalLoading(_props: GlobalLoadingProps) {
  return null;
}

export default GlobalLoading;
`);

writeWebFile("src/components/layout/navigation-loading-provider.tsx", `
// /web/src/components/layout/navigation-loading-provider.tsx
"use client";

import type { ReactNode } from "react";

type NavigationLoadingProviderProps = {
  children: ReactNode;
};

export function NavigationLoadingProvider({ children }: NavigationLoadingProviderProps) {
  return <>{children}</>;
}

export default NavigationLoadingProvider;
`);

writeNullLoading("src/app/loading.tsx", "RootLoading");
writeNullLoading("src/app/login/loading.tsx", "LoginLoading");
writeNullLoading("src/app/register/loading.tsx", "RegisterLoading");

/**
 * 2) Skeleton único do Admin.
 */
writeWebFile("src/components/admin/admin-dashboard-skeleton.tsx", `
// /web/src/components/admin/admin-dashboard-skeleton.tsx
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "animate-pulse rounded-[28px] bg-white shadow-sm ring-1 ring-[#E0DDD6] dark:bg-[#1C1C1C] dark:ring-[#2A2A2A] motion-reduce:animate-none " +
        className
      }
    />
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-[36px] border border-[#E0DDD6] bg-white p-6 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C] sm:p-8">
        <SkeletonBlock className="h-7 w-36 rounded-full bg-[#FAF7F2] dark:bg-white/[0.06]" />
        <SkeletonBlock className="mt-5 h-10 w-full max-w-xl bg-[#FAF7F2] dark:bg-white/[0.06]" />
        <SkeletonBlock className="mt-4 h-5 w-full max-w-2xl bg-[#FAF7F2] dark:bg-white/[0.06]" />
        <SkeletonBlock className="mt-2 h-5 w-full max-w-lg bg-[#FAF7F2] dark:bg-white/[0.06]" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-44 bg-white dark:bg-[#1C1C1C]" />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-40 bg-white dark:bg-[#1C1C1C]" />
        ))}
      </section>
    </div>
  );
}
`);

writeWebFile("src/app/dashboard/loading.tsx", `
// /web/src/app/dashboard/loading.tsx
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";

export default function DashboardLoading() {
  return <AdminDashboardSkeleton />;
}
`);

/**
 * 3) Controller SPA: não mostra tela, barra, status nem overlay.
 * Ele só avisa o AdminShell para trocar children por Skeleton dentro do main.
 */
writeWebFile("src/components/admin/admin-route-loading.tsx", `
// /web/src/components/admin/admin-route-loading.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

type AdminSpaNavigationControllerProps = {
  onNavigatingChange: (isNavigating: boolean) => void;
};

function isModifiedEvent(event: MouseEvent): boolean {
  return Boolean(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);
}

function shouldTriggerForAnchor(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");

  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    return (
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/settings")
    );
  } catch {
    return false;
  }
}

export function AdminSpaNavigationController({ onNavigatingChange }: AdminSpaNavigationControllerProps) {
  const pathname = usePathname();
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedEvent(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldTriggerForAnchor(anchor)) return;

      const url = new URL(anchor.href);
      const current = window.location.pathname + window.location.search;
      const next = url.pathname + url.search;

      if (current === next) return;

      onNavigatingChange(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        onNavigatingChange(false);
      }, 5000);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [onNavigatingChange]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      onNavigatingChange(false);
    }, 160);

    return () => window.clearTimeout(id);
  }, [pathname, onNavigatingChange]);

  return null;
}
`);

/**
 * 4) AdminShell: página sólida, sem blobs/translucidez.
 * Translucidez fica apenas nos componentes estruturais Sidebar/Topbar.
 */
writeWebFile("src/components/admin/admin-shell.tsx", `
// /web/src/components/admin/admin-shell.tsx
"use client";

import * as React from "react";
import { getAdminNavigationGroups } from "@/constants/admin-navigation";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";
import { AdminSpaNavigationController } from "@/components/admin/admin-route-loading";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import type { AdminLayoutContext } from "@/types/admin";

type AdminShellProps = {
  context: AdminLayoutContext;
  children: React.ReactNode;
};

export function AdminShell({ context, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const navigationGroups = React.useMemo(
    () =>
      getAdminNavigationGroups({
        accountScope: context.profile.accountScope,
        internalRole: context.profile.internalRole,
        internalTeam: context.profile.internalTeam,
        speciesCode: context.identity.speciesCode,
        stageCode: context.identity.stageCode,
        governanceRoleCode: context.identity.governanceRoleCode,
        rootGovernanceEnabled: context.identity.rootGovernanceEnabled,
      }),
    [context]
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAF7F2] text-[#111111] selection:bg-[#006D4E]/15 dark:bg-[#111111] dark:text-[#FAF7F2]">
      <AdminSidebar
        currentAdmin={context}
        groups={navigationGroups}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={
          collapsed
            ? "relative min-h-screen transition-[padding] duration-300 ease-out motion-reduce:transition-none lg:pl-[112px]"
            : "relative min-h-screen transition-[padding] duration-300 ease-out motion-reduce:transition-none lg:pl-[328px]"
        }
      >
        <AdminTopbar
          currentAdmin={context}
          groups={navigationGroups}
          pendingAlerts={context.pendingAlerts}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />

        <AdminSpaNavigationController onNavigatingChange={setIsNavigating} />

        <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
          {isNavigating ? <AdminDashboardSkeleton /> : children}
        </main>
      </div>
    </div>
  );
}
`);

/**
 * 5) Sidebar: efeito translúcido próprio, letra menor, mais folga, perfil discreto.
 */
writeWebFile("src/components/admin/admin-sidebar.tsx", `
// /web/src/components/admin/admin-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Flag,
  FlaskConical,
  GitBranch,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Route,
  Scale,
  ScrollText,
  ServerCog,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  UserRound,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import type { AdminLayoutContext } from "@/types/admin";
import type { AdminNavigationGroup, AdminNavigationIcon } from "@/constants/admin-navigation";

type AdminSidebarProps = {
  currentAdmin: AdminLayoutContext;
  groups: AdminNavigationGroup[];
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

const ICONS: Record<AdminNavigationIcon, LucideIcon> = {
  LayoutDashboard,
  UsersRound,
  Building2,
  ClipboardCheck,
  Sprout,
  KeyRound,
  ShieldCheck,
  ScrollText,
  Scale,
  Flag,
  BookOpen,
  Palette,
  GitBranch,
  FlaskConical,
  Wrench,
  Route,
  ShieldAlert,
  ServerCog,
};

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function initials(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/[\\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "I") + (parts[1]?.[0] ?? "R")).toUpperCase();
}

function getDisplayName(currentAdmin: AdminLayoutContext): string {
  return currentAdmin.profile.fullName ?? currentAdmin.ecosystemProfile?.displayName ?? currentAdmin.user.email.split("@")[0] ?? "Admin IRÍS";
}

function getDisplayUsername(currentAdmin: AdminLayoutContext): string {
  const username = currentAdmin.profile.username ?? currentAdmin.ecosystemProfile?.username;
  return username ? "@" + username : currentAdmin.user.email;
}

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function Badge({ badge }: { badge?: "root" | "soon" | "critical" }) {
  if (!badge) return null;

  const label = badge === "root" ? "Root" : badge === "soon" ? "Breve" : "Novo";

  return (
    <span
      className={cx(
        "rounded-full border px-1.5 py-0.5 text-[9px] font-medium",
        badge === "critical" && "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]",
        badge === "root" && "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]",
        badge === "soon" && "border-[#E0DDD6] bg-white/55 text-[#666666] dark:border-[#2A2A2A] dark:bg-white/[0.04] dark:text-[#8A8A8A]"
      )}
    >
      {label}
    </span>
  );
}

function SidebarItem({
  href,
  title,
  description,
  icon,
  badge,
  pathname,
  onNavigate,
}: {
  href: string;
  title: string;
  description: string;
  icon: AdminNavigationIcon;
  badge?: "root" | "soon" | "critical";
  pathname: string;
  onNavigate: () => void;
}) {
  const active = isItemActive(pathname, href);
  const Icon = ICONS[icon];

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cx(
        "group flex items-start gap-3 rounded-[18px] border px-3 py-3 text-[12px] transition duration-200 motion-reduce:transition-none",
        active
          ? "border-[#006D4E]/18 bg-[#006D4E]/[0.085] text-[#006D4E] shadow-[0_8px_24px_rgba(0,109,78,0.07)]"
          : "border-transparent text-[#444444] hover:border-[#E0DDD6]/80 hover:bg-white/52 hover:text-[#111111] dark:text-[#C0C0C0] dark:hover:border-[#2A2A2A] dark:hover:bg-white/[0.04] dark:hover:text-[#FAF7F2]"
      )}
    >
      <Icon
        className={cx("mt-0.5 size-3.5 shrink-0", active ? "text-[#006D4E]" : "text-[#666666] group-hover:text-[#006D4E]")}
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-medium tracking-[-0.01em]">{title}</span>
          <Badge badge={badge} />
        </span>
        <span className="mt-1 block text-[11px] leading-5 text-[#666666] dark:text-[#8A8A8A]">{description}</span>
      </span>
    </Link>
  );
}

export function AdminSidebar({ currentAdmin, groups, mobileOpen, setMobileOpen, collapsed, setCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const displayName = getDisplayName(currentAdmin);
  const displayUsername = getDisplayUsername(currentAdmin);
  const diagnosticCode = currentAdmin.identity.diagnosticCode ?? "IRIS-IDENTITY-PENDING";

  return (
    <>
      <button
        type="button"
        aria-label="Fechar navegação administrativa"
        className={cx(
          "fixed inset-0 z-40 bg-[#111111]/25 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cx(
          "fixed left-0 top-0 z-50 flex h-dvh w-[318px] max-w-[86vw] flex-col border-r border-[#E0DDD6]/70 bg-white/[0.66] shadow-[0_24px_80px_rgba(17,17,17,0.10)] backdrop-blur-3xl transition-[transform,width] duration-300 ease-out motion-reduce:transition-none dark:border-[#2A2A2A]/90 dark:bg-[#1C1C1C]/[0.66] lg:left-5 lg:top-5 lg:h-[calc(100dvh-40px)] lg:rounded-[30px] lg:border",
          collapsed ? "lg:w-[78px]" : "lg:w-[292px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Navegação administrativa IRÍS"
      >
        <header className={cx("flex items-center border-b border-[#E0DDD6]/60 px-4 py-4 dark:border-[#2A2A2A]", collapsed ? "lg:justify-center" : "justify-between")}>
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-[#006D4E]/15 bg-[#006D4E]/10 text-[#006D4E] shadow-sm">
              <Sparkles className="size-4" strokeWidth={1.75} />
            </span>

            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold tracking-[0.18em] text-[#111111] dark:text-[#FAF7F2]">IRÍS</span>
                <span className="block truncate text-[11px] text-[#666666] dark:text-[#8A8A8A]">Admin Social</span>
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              aria-label="Fechar menu no mobile"
              className="grid size-9 place-items-center rounded-full border border-[#E0DDD6]/70 bg-white/45 text-[#666666] transition hover:text-[#111111] dark:border-[#2A2A2A] dark:bg-white/[0.04] dark:hover:text-[#FAF7F2] lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="size-4" />
            </button>
          )}
        </header>

        <div className={cx("flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", collapsed ? "lg:px-2" : "")}>
          <nav className="space-y-4">
            {groups.map((group) => {
              const GroupIcon = ICONS[group.icon];
              const activeGroup = group.items.some((item) => isItemActive(pathname, item.href));

              if (collapsed) {
                const firstItem = group.items[0];

                return (
                  <Link
                    key={group.title}
                    href={firstItem?.href ?? "/dashboard"}
                    title={group.title + " — " + group.description}
                    className={cx(
                      "hidden place-items-center rounded-2xl border p-3 transition lg:grid",
                      activeGroup
                        ? "border-[#006D4E]/18 bg-[#006D4E]/10 text-[#006D4E]"
                        : "border-transparent text-[#666666] hover:border-[#E0DDD6]/80 hover:bg-white/45 hover:text-[#006D4E] dark:hover:border-[#2A2A2A] dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <GroupIcon className="size-4" strokeWidth={1.75} />
                    <span className="sr-only">{group.title}</span>
                  </Link>
                );
              }

              return (
                <details key={group.title} className="group rounded-3xl" open={activeGroup || group.title === "Ecossistema"}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666666] transition hover:bg-white/45 dark:text-[#8A8A8A] dark:hover:bg-white/[0.04] [&::-webkit-details-marker]:hidden">
                    <GroupIcon className={cx("size-3.5", activeGroup ? "text-[#006D4E]" : "text-[#8A8A8A]")} strokeWidth={1.75} />
                    <span className="min-w-0 flex-1 truncate">{group.title}</span>
                    <ChevronDown className="size-3.5 text-[#8A8A8A] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>

                  <div className="mt-2 space-y-1.5">
                    {group.items.map((item) => (
                      <SidebarItem
                        key={item.href}
                        href={item.href}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        badge={item.badge}
                        pathname={pathname}
                        onNavigate={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </nav>
        </div>

        <footer className="border-t border-[#E0DDD6]/60 bg-white/[0.34] p-3 backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-white/[0.025]">
          <div className={cx("rounded-[22px] border border-[#E0DDD6]/70 bg-[#FAF7F2]/55 p-3 dark:border-[#2A2A2A] dark:bg-[#111111]/45", collapsed ? "lg:p-2" : "")}>
            <div className={cx("flex items-center gap-3", collapsed ? "lg:justify-center" : "")}>
              <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[#111111] text-[11px] font-semibold text-[#FAF7F2] dark:bg-[#FAF7F2] dark:text-[#111111]">
                {initials(displayName, currentAdmin.user.email)}
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#111111] dark:text-[#FAF7F2]">{displayName}</p>
                  <p className="truncate text-[11px] text-[#666666] dark:text-[#8A8A8A]">{displayUsername}</p>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="mt-3 rounded-2xl border border-[#006D4E]/12 bg-[#006D4E]/[0.06] px-3 py-2.5 text-[#006D4E]">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                    <Sprout className="size-3" />
                    {currentAdmin.access.label}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 break-words font-mono text-[9px] leading-4 text-[#183A2E] dark:text-[#BDE8D7]">
                  {diagnosticCode}
                </p>
              </div>
            )}

            <div className={cx("mt-2 grid gap-1", collapsed ? "lg:hidden" : "")}>
              <Link href="/settings/profile" className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[11px] text-[#444444] transition hover:bg-white/60 dark:text-[#C0C0C0] dark:hover:bg-white/[0.04]">
                <UserRound className="size-3.5" /> Meu perfil
              </Link>
              <Link href="/settings" className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[11px] text-[#444444] transition hover:bg-white/60 dark:text-[#C0C0C0] dark:hover:bg-white/[0.04]">
                <Settings className="size-3.5" /> Preferências
              </Link>
              <Link href="/logout" className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-[11px] font-medium text-red-700 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30">
                <LogOut className="size-3.5" /> Sair
              </Link>
            </div>
          </div>

          <button
            type="button"
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            className="mt-3 hidden w-full items-center justify-center gap-2 rounded-2xl border border-[#E0DDD6]/70 bg-white/45 px-3 py-2 text-[11px] font-medium text-[#666666] transition hover:text-[#111111] dark:border-[#2A2A2A] dark:bg-white/[0.04] dark:hover:text-[#FAF7F2] lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="size-3.5" />
            {!collapsed && "Recolher"}
          </button>
        </footer>
      </aside>
    </>
  );
}
`);

/**
 * 6) Topbar: translúcida própria, sem efeito na página.
 */
writeWebFile("src/components/admin/admin-topbar.tsx", `
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
  return BREADCRUMB_LABELS[segment] ?? segment.replace(/-/g, " ").replace(/^\\w/, (match) => match.toUpperCase());
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
`);

/**
 * 7) Dashboard: página e cards sólidos. Sem backdrop/translucidez no conteúdo.
 */
writeWebFile("src/app/dashboard/page.tsx", `
// /web/src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  LockKeyhole,
  Network,
  Orbit,
  ShieldCheck,
  Sparkles,
  Sprout,
  UsersRound,
  Waves,
} from "lucide-react";
import { getAdminDashboardSnapshot, getAdminLayoutContext } from "@/lib/admin/admin-context";
import type { DashboardMetric } from "@/types/admin";

export const dynamic = "force-dynamic";

function metricIcon(label: string): LucideIcon {
  if (label.includes("Perfis")) return UsersRound;
  if (label.includes("Organizações")) return Building2;
  if (label.includes("Solicitações")) return ClipboardCheck;
  if (label.includes("Flora")) return Sprout;
  return ShieldCheck;
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = metricIcon(metric.label);

  const stateClass =
    metric.state === "warning"
      ? "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]"
      : metric.state === "restricted"
        ? "border-[#E0DDD6] bg-[#FAF7F2] text-[#666666] dark:border-[#2A2A2A] dark:bg-[#111111] dark:text-[#8A8A8A]"
        : "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]";

  return (
    <article className="rounded-[30px] border border-[#E0DDD6] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
      <div className="flex items-start justify-between gap-4">
        <div className={"grid size-11 place-items-center rounded-2xl border " + stateClass}>
          <Icon className="size-5" strokeWidth={1.75} />
        </div>

        {metric.state === "restricted" && <LockKeyhole className="size-4 text-[#8A8A8A]" />}
      </div>

      <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-[#666666] dark:text-[#8A8A8A]">{metric.label}</p>
      <strong className="mt-1 block text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">{metric.value}</strong>
      <p className="mt-3 text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">{metric.description}</p>
    </article>
  );
}

function PrincipleCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: "green" | "forest" | "emotion";
}) {
  const toneClass =
    tone === "emotion"
      ? "border-[#9A7CA7]/25 bg-[#9A7CA7]/10 text-[#6F557A] dark:text-[#D7BEDF]"
      : tone === "forest"
        ? "border-[#183A2E]/20 bg-[#183A2E]/10 text-[#183A2E] dark:text-[#BDE8D7]"
        : "border-[#006D4E]/20 bg-[#006D4E]/10 text-[#006D4E]";

  return (
    <article className="rounded-[28px] border border-[#E0DDD6] bg-white p-5 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
      <div className={"grid size-10 place-items-center rounded-2xl border " + toneClass}>
        <Icon className="size-4" />
      </div>

      <h2 className="mt-4 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{title}</h2>
      <p className="mt-2 text-[13px] leading-6 text-[#444444] dark:text-[#C0C0C0]">{text}</p>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const result = await getAdminLayoutContext();

  if (result.status === "unauthenticated") {
    redirect("/login?redirectTo=/dashboard");
  }

  if (result.status === "forbidden") {
    redirect("/login");
  }

  const { context } = result;
  const snapshot = await getAdminDashboardSnapshot(context);
  const displayName = context.profile.fullName ?? context.ecosystemProfile?.displayName ?? "Administrador IRÍS";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[38px] border border-[#E0DDD6] bg-white p-6 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C] sm:p-8">
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-[11px] font-medium text-[#006D4E]">
              <Sparkles className="size-3.5" />
              {context.access.label}
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2] sm:text-4xl">Painel Administrativo IRÍS</h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">
              Bem-vindo, {displayName}. Uma visão operacional calma para governar identidade, instituições, moderação e segurança sem transformar o painel em ruído.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
            <div className="rounded-[26px] border border-[#006D4E]/15 bg-[#006D4E]/[0.075] p-4 text-[#183A2E] dark:text-[#BDE8D7]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#006D4E]">Assinatura Flora</p>
              <p className="mt-2 line-clamp-3 break-words font-mono text-[11px] leading-5">{context.identity.diagnosticCode ?? "Identidade pendente"}</p>
            </div>

            <div className="rounded-[26px] border border-[#9A7CA7]/20 bg-[#9A7CA7]/10 p-4 text-[#6F557A] dark:text-[#D7BEDF]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">Estado</p>
              <p className="mt-2 text-sm font-semibold">{context.identity.identityStatus === "active" ? "Governança ativa" : "Revisar identidade"}</p>
              <p className="mt-1 text-[11px] leading-5">Sessão protegida por Server Component e Supabase SSR.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[32px] border border-[#E0DDD6] bg-white p-5 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C] lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#006D4E]">Tempo Bem Gasto</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2]">Operação sem métricas de vaidade</h2>
            </div>

            <div className="grid size-12 place-items-center rounded-2xl border border-[#183A2E]/20 bg-[#183A2E]/10 text-[#183A2E] dark:text-[#BDE8D7]">
              <Waves className="size-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Identidade", "Instituições", "Moderação"].map((item, index) => (
              <div key={item} className="rounded-2xl border border-[#E0DDD6] bg-[#FAF7F2] p-3 dark:border-[#2A2A2A] dark:bg-[#111111]">
                <p className="text-[11px] text-[#666666] dark:text-[#8A8A8A]">Camada {index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <PrincipleCard
          icon={Network}
          title="SPA administrativa"
          text="A navegação interna usa apenas skeleton imediato dentro do conteúdo, sem tela global de carregamento."
          tone="green"
        />

        <PrincipleCard
          icon={Orbit}
          title="Motor Flora"
          text="Menus e ações continuam derivados do contexto de espécie, estágio e governança."
          tone="emotion"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <PrincipleCard
          icon={ShieldCheck}
          title="Segurança server-first"
          text="O layout valida sessão, admin_profile e botanic_identity no servidor antes de renderizar a interface administrativa."
          tone="green"
        />

        <PrincipleCard
          icon={Sprout}
          title="Governança discreta"
          text="Root Governance orienta permissões, mas não concede leitura de conteúdo íntimo ou criptografado."
          tone="forest"
        />

        <PrincipleCard
          icon={ArrowUpRight}
          title="Próximo bloco"
          text="Agora a base visual está pronta para telas reais: solicitações, chaves internas, auditoria e feature flags."
          tone="emotion"
        />
      </section>
    </div>
  );
}
`);

/**
 * 8) Placeholder também sólido, para rotas ainda sem implementação real.
 */
writeWebFile("src/components/admin/admin-placeholder-page.tsx", `
// /web/src/components/admin/admin-placeholder-page.tsx
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  badge: string;
};

export function AdminPlaceholderPage({ title, description, badge }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] border border-[#E0DDD6] bg-white p-6 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C] sm:p-8">
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#006D4E]/15 bg-[#006D4E]/10 px-3 py-1.5 text-xs font-medium text-[#006D4E]">
            <Sparkles className="size-3.5" />
            {badge}
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#111111] dark:text-[#FAF7F2] sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#444444] dark:text-[#C0C0C0]">{description}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#E0DDD6] bg-white p-5 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ShieldCheck className="size-4 text-[#006D4E]" /> Segurança preservada
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            Esta rota já herda o layout protegido do Dashboard. A implementação real deve continuar usando Server Components, RLS e validação no servidor.
          </p>
        </article>

        <article className="rounded-[28px] border border-[#E0DDD6] bg-white p-5 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[#111111] dark:text-[#FAF7F2]">
            <ArrowUpRight className="size-4 text-[#006D4E]" /> Próximo incremento
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444444] dark:text-[#C0C0C0]">
            O placeholder evita 404 durante a navegação e mantém a experiência SPA com skeleton imediato.
          </p>
        </article>
      </section>
    </div>
  );
}
`);

const packagePath = path.join(webRoot, "package.json");

if (exists(packagePath) && process.env.IRIS_SKIP_TYPECHECK !== "1") {
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  if (pkg.scripts && pkg.scripts.typecheck) {
    console.log("\\nExecutando typecheck...");
    const result = spawnSync("npm", ["run", "typecheck"], {
      cwd: webRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    if (result.status !== 0) {
      console.error("\\nTypecheck falhou. Arquivos escritos. Backups em:");
      console.error(backupRoot);
      process.exit(result.status ?? 1);
    }
  } else {
    console.log("\\nSem script typecheck no package.json. Validação automática pulada.");
  }
}

console.log("\\nAdmin SPA-only concluído.");
console.log("Web root:", webRoot);
console.log("Backups:", backupRoot);
console.log("\\nPróximo comando:");
console.log("cd " + webRoot);
console.log("npm run dev");
