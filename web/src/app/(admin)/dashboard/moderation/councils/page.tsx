// /web/src/app/dashboard/moderation/councils/page.tsx
import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <AdminPlaceholderPage
      title="Conselhos de Usuários"
      description="Operação futura de júris rotativos, reputação comunitária e disputas."
      badge="Moderação"
    />
  );
}
