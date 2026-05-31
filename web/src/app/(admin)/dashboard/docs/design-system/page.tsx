import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { ArticlesManagementView } from "@/components/admin/docs/articles-management-view";
import { Suspense } from "react";
import { DocsManagementSkeleton } from "@/components/admin/docs/docs-skeleton";

export const dynamic = "force-dynamic";

async function DesignSystemDataFetch() {
  const supabase = await createSupabaseServerComponentClient();
  if (!supabase) return <div className="p-6">Erro crítico de inicialização do Supabase.</div>;

  const { data: articles } = await supabase
    .from("docs_articles")
    .select("*")
    .eq("category", "guide")
    .order("created_at", { ascending: false });

  return (
    <ArticlesManagementView
      title="Design System"
      description="Gerenciamento de bibliotecas de componentes, tokens visuais de interface e padrões operacionais de UX."
      category="guide"
      defaultSubcategory="Componentes Interface"
      articles={articles || []}
      badgeColor="text-purple-500"
    />
  );
}

export default function DesignSystemDashboardPage() {
  return (
    <Suspense fallback={<DocsManagementSkeleton />}>
      <DesignSystemDataFetch />
    </Suspense>
  );
}