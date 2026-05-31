import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { ArticlesManagementView } from "@/components/admin/docs/articles-management-view";
import { Suspense } from "react";
import { DocsManagementSkeleton } from "@/components/admin/docs/docs-skeleton";

export const dynamic = "force-dynamic";

async function ModerationGuidesDataFetch() {
  const supabase = await createSupabaseServerComponentClient();
  if (!supabase) return <div className="p-6">Erro crítico de inicialização do Supabase.</div>;

  const { data: articles } = await supabase
    .from("docs_articles")
    .select("*")
    .in("category", ["community", "legal"])
    .order("created_at", { ascending: false });

  return (
    <ArticlesManagementView
      title="Guias de Moderação"
      description="Políticas ativas do ecossistema, termos legais de governança e regimentos éticos para conselhos internos."
      category="community"
      defaultSubcategory="Políticas Comunitárias"
      articles={articles || []}
      badgeColor="text-rose-500"
    />
  );
}

export default function ModerationGuidesDashboardPage() {
  return (
    <Suspense fallback={<DocsManagementSkeleton />}>
      <ModerationGuidesDataFetch />
    </Suspense>
  );
}