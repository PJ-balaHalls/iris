// /web/src/app/dashboard/feature-flags/experiments/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Rotas e Experimentos"
      description="Liberação gradual por espécie, equipe, papel de governança ou rota."
      badge="Feature Flags"
    />
  );
}
