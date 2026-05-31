// /web/src/app/dashboard/organizations/access-codes/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Códigos de Acesso"
      description="Gerência de códigos institucionais hashados, expiração e rotatividade segura."
      badge="Root Governance"
    />
  );
}
