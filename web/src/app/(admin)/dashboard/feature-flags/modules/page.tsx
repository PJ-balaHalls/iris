// /web/src/app/dashboard/feature-flags/modules/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Módulos do Ecossistema"
      description="Controle de liberação de iLIFE, usLIFE, Aurora, Marketplace e integrações."
      badge="Feature Flags"
    />
  );
}
