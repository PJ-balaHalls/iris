import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { DocRenderer } from "@/components/marketing/docs/doc-renderer";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PublicArticlePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const supabase = await createSupabaseServerComponentClient();
  if (!supabase) return notFound();

  const { slug } = await params;

  // 1. Blindagem: Trocamos o .single() por .limit(1) para evitar quebra com dados duplicados
  const { data: articles, error } = await supabase
    .from("docs_articles")
    .select("*")
    .eq("slug", slug)
    .limit(1);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-lg border border-red-200 shadow-sm">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="size-5" /> Erro ao processar leitura
          </h2>
          <p className="text-sm font-mono opacity-80">{error.message}</p>
        </div>
      </div>
    );
  }

  // Pegamos o primeiro item do array de forma segura
  const article = articles?.[0];

  // 404 real: Se o array estiver vazio
  if (!article) return notFound();

  // 2. Busca do Autor com a mesma blindagem de .limit(1)
  let authorData = null;
  if (article.author_id) {
    const { data: profiles } = await supabase
      .from("ecosystem_profiles")
      .select("display_name, username, avatar_path")
      .eq("user_id", article.author_id)
      .limit(1);
    
    const profile = profiles?.[0];
    if (profile) {
      authorData = {
        full_name: profile.display_name,
        username: profile.username,
        avatar_path: profile.avatar_path
      };
    }
  }

  const enrichedArticle = {
    ...article,
    author: authorData
  };

  return (
    <main className="min-h-[100svh] bg-background pt-32 pb-24">
      <div className="max-w-[var(--layout-page-max)] mx-auto px-6 md:px-10 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-accent transition-colors">
          <ArrowLeft className="size-4" /> Voltar para o Acervo
        </Link>
        
        {!article.is_published && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full border border-amber-500/20">
            <AlertCircle className="size-3" /> Visualização de Rascunho
          </span>
        )}
      </div>
      
      <DocRenderer article={enrichedArticle} />
    </main>
  );
}