// /web/src/app/dashboard/ecosystem/profiles/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Perfis Globais"
      description="Consulta de perfis globais do ecossistema, usernames e status de onboarding."
      badge="Ecossistema"
    />
  );
}
