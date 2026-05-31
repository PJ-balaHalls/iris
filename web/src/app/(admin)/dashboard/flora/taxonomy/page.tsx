// /web/src/app/dashboard/flora/taxonomy/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Taxonomia Flora"
      description="Catálogo de espécies, estágios, inclinações e papéis de governança."
      badge="Root Governance"
    />
  );
}
