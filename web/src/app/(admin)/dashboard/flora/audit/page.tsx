// /web/src/app/dashboard/flora/audit/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Auditoria Global"
      description="Trilha de auditoria para alterações sensíveis do Motor Flora."
      badge="Root Governance"
    />
  );
}
