// /web/src/app/dashboard/organizations/requests/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Solicitações Pendentes"
      description="Revisão de solicitações de associação institucional sem bypassar governança."
      badge="Institucional"
    />
  );
}
