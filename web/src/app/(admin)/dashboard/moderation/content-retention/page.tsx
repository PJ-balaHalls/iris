// /web/src/app/dashboard/moderation/content-retention/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Conteúdo & Retenção"
      description="Monitoramento de denúncias sem quebrar privacidade, E2EE ou Zero-Knowledge."
      badge="Moderação"
    />
  );
}
