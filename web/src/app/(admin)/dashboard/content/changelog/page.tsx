import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { Suspense } from "react";
// O import abaixo deve apontar para o seu componente de view que criamos
import { ChangelogDashboardClientView } from "@/app/(admin)/dashboard/content/changelog/changelog-client-view";
import { DocsManagementSkeleton } from "@/components/admin/docs/docs-skeleton";

export const dynamic = "force-dynamic";

async function ChangelogDataFetch() {
  const supabase = await createSupabaseServerComponentClient();
  if (!supabase) return <div className="p-6">Erro de inicialização do Supabase.</div>;

  const { data: logs } = await supabase
    .from("changelog_entries")
    .select("*")
    .order("released_at", { ascending: false });

  return <ChangelogDashboardClientView logs={logs || []} />;
}

export default function ChangelogDashboardPage() {
  return (
    <Suspense fallback={<DocsManagementSkeleton />}>
      <ChangelogDataFetch />
    </Suspense>
  );
}