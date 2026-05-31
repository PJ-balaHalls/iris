// /web/src/app/dashboard/organizations/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Organizações"
      description="Gestão institucional de empresas, diretórios e vínculos B2B."
      badge="Institucional"
    />
  );
}
