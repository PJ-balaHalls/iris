// /web/src/app/dashboard/moderation/ethics/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Comitê de Ética"
      description="Gestão futura de casos complexos, mediação e decisões do comitê."
      badge="Moderação"
    />
  );
}
