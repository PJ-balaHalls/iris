// /web/src/app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminLayoutContext } from "@/lib/admin/admin-context";

export const dynamic = "force-dynamic";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const result = await getAdminLayoutContext();

  if (result.status === "unauthenticated") {
    redirect("/login?redirectTo=/dashboard");
  }

  if (result.status === "forbidden") {
    redirect("/login");
  }

  return <AdminShell context={result.context}>{children}</AdminShell>;
}