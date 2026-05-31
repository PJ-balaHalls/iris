import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { ArticlesManagementView } from "@/components/admin/docs/articles-management-view";
import { Suspense } from "react";
import { DocsManagementSkeleton } from "@/components/admin/docs/docs-skeleton";

export const dynamic = "force-dynamic";

async function ArchitectureDataFetch() {
  const supabase = await createSupabaseServerComponentClient();
  if (!supabase) return <div className="p-6">Erro crítico de inicialização do Supabase.</div>;

  const { data: articles } = await supabase
    .from("docs_articles")
    .select("*")
    .eq("category", "api")
    .order("created_at", { ascending: false });

  return (
    <ArticlesManagementView
      title="Arquitetura e Manuais"
      description="Central interna estrutural para gerenciamento do Admin, Motor Flora e specs de dados do Product Book."
      category="api"
      defaultSubcategory="Engenharia Core"
      articles={articles || []}
      badgeColor="text-emerald-500"
    />
  );
}

export default function ArchitectureDashboardPage() {
  return (
    <Suspense fallback={<DocsManagementSkeleton />}>
      <ArchitectureDataFetch />
    </Suspense>
  );
}