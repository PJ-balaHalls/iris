// /web/src/app/dashboard/feature-flags/kill-switches/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Manutenção e Kill Switches"
      description="Chaves emergenciais para pausar onboarding, uploads e rotas críticas."
      badge="Feature Flags"
    />
  );
}
