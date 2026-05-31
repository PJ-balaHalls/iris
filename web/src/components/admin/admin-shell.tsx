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
    [context],
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