// /web/src/app/dashboard/ecosystem/health/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Saúde do Ecossistema"
      description="Leitura operacional segura para sessão, Supabase, RLS, storage e integridade."
      badge="Engenharia"
    />
  );
}
