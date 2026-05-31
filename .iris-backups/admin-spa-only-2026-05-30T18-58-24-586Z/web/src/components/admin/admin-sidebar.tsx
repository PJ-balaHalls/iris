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
  const parts = source.split(/[\s@.]+/).filter(Boolean);
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
          "fixed left-0 top-0 z-50 flex h-dvh w-[318px] max-w-[86vw] flex-col border-r border-[#E0DDD6]/70 bg-white/[0.68] shadow-[0_24px_80px_rgba(17,17,17,0.10)] backdrop-blur-3xl transition-[transform,width] duration-300 ease-out motion-reduce:transition-none dark:border-[#2A2A2A]/90 dark:bg-[#1C1C1C]/[0.68] lg:left-5 lg:top-5 lg:h-[calc(100dvh-40px)] lg:rounded-[30px] lg:border",
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

        <footer className="border-t border-[#E0DDD6]/60 bg-white/[0.38] p-3 backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-white/[0.025]">
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
                <p className="mt-1 line-clamp-2 break-words font-mono text-[9px] leading-4 text-[#183A2E] dark:text-[#BDE8D7]">{diagnosticCode}</p>
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
