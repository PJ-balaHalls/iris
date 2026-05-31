// /web/src/app/dashboard/flora/identities/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Identidades Botânicas"
      description="Gestão de botanic_identities, assinaturas Flora e poderes de governança."
      badge="Root Governance"
    />
  );
}
