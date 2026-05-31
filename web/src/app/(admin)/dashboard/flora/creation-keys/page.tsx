// /web/src/app/dashboard/flora/creation-keys/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Chaves de Criação"
      description="Geração e revogação de chaves internas para perfis elevados."
      badge="Root Governance"
    />
  );
}
