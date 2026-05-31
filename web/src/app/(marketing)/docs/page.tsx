import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { renderDynamicIcon } from "@/lib/utils/icons-map";
import Link from "next/link";
import { Layers, ArrowRight, Clock, BookOpen, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

// Configuração visual para cada tipo de caderno de documentação
const notebooksConfig: Record<string, { label: string; desc: string; gradient: string; iconColor: string }> = {
  guide: { 
    label: "Manuais Operacionais", 
    desc: "Diretrizes internas, tutoriais de uso e manuais de processos.", 
    gradient: "from-blue-500/20 to-indigo-500/5",
    iconColor: "text-blue-500"
  },
  api: { 
    label: "Arquitetura & API", 
    desc: "Contratos de infraestrutura, schemas e integração do Motor Flora.", 
    gradient: "from-emerald-500/20 to-teal-500/5",
    iconColor: "text-emerald-500"
  },
  legal: { 
    label: "Acervo Legal", 
    desc: "Termos de privacidade, políticas de compliance e governança.", 
    gradient: "from-purple-500/20 to-pink-500/5",
    iconColor: "text-purple-500"
  },
  community: { 
    label: "Comunidade & Ética", 
    desc: "Diretrizes de moderação, conselhos e engajamento comunitário.", 
    gradient: "from-rose-500/20 to-orange-500/5",
    iconColor: "text-rose-500"
  },
  blog: { 
    label: "Updates e Boletins", 
    desc: "Comunicação editorial ativa e notas técnicas de release.", 
    gradient: "from-amber-500/20 to-yellow-500/5",
    iconColor: "text-amber-500"
  },
};

export default async function PublicDocsPage() {
  const supabase = await createSupabaseServerComponentClient();
  
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 flex items-center gap-3">
          <AlertCircle className="size-5" />
          <p className="font-medium">Falha crítica ao conectar com o banco de dados.</p>
        </div>
      </div>
    );
  }

  // Busca apenas os artigos publicados (visíveis para o público)
  const { data: articles, error } = await supabase
    .from("docs_articles")
    .select("id, title, slug, description, category, subcategory, complexity, icon, estimated_reading_time, created_at")
    .eq("is_published", true)
    .order("subcategory", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
          <h2 className="font-bold flex items-center gap-2 mb-2"><AlertCircle className="size-5" /> Erro de Leitura</h2>
          <p className="text-sm font-mono opacity-80">{error.message}</p>
        </div>
      </div>
    );
  }

  // Agrupamento Estilo Cadernos (Notebooks)
  const notebooks = articles?.reduce((acc, current) => {
    const cat = current.category || "guide";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(current);
    return acc;
  }, {} as Record<string, typeof articles>);

  return (
    <main className="min-h-[100svh] bg-background pb-24">
      {/* Header Público */}
      <header className="border-b border-border bg-surface/40 pt-36 pb-20 px-6 md:px-10">
        <div className="mx-auto max-w-[var(--layout-page-max)]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground-secondary shadow-irisSm">
              <Layers className="size-4 text-accent" />
              Acervo Documental Centralizado
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.05em] text-foreground leading-[0.95] mb-6">
              Documentação do Ecossistema
            </h1>
            <p className="text-lead text-foreground-secondary leading-relaxed">
              Acesso transparente às definições estratégicas e operacionais do IRÍS organizadas em cadernos dinâmicos integrados.
            </p>
          </div>
        </div>
      </header>

      {/* Seção de Cadernos */}
      <section className="mx-auto max-w-[var(--layout-page-max)] px-6 pt-16 md:px-10 space-y-20">
        
        {(!articles || articles.length === 0) && (
          <div className="text-center py-24 border border-dashed border-border bg-surface/30 rounded-3xl text-foreground-muted flex flex-col items-center gap-4">
            <BookOpen className="size-10 opacity-50" />
            <div>
              <h3 className="text-lg font-bold text-foreground">Acervo em Construção</h3>
              <p className="text-sm">Nenhum documento público foi publicado ainda.</p>
            </div>
          </div>
        )}

        {Object.entries(notebooks || {}).map(([category, docs]) => {
          const config = notebooksConfig[category] || { 
            label: "Geral", 
            desc: "Documentações diversas e arquivos não categorizados.", 
            gradient: "from-gray-500/10 to-transparent",
            iconColor: "text-foreground-muted"
          };
          
          return (
            <div key={category} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 border-t border-border pt-12">
              
              {/* Informações do Caderno (Lado Esquerdo) */}
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} border border-border flex items-center justify-center`}>
                  <BookOpen className={`size-5 ${config.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.02em] text-foreground">{config.label}</h2>
                  <p className="text-sm text-foreground-muted mt-2 leading-relaxed">{config.desc}</p>
                </div>
              </div>

              {/* Lista de Documentos do Caderno (Lado Direito) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docs.map((doc) => (
                  <Link
                    href={`/docs/${doc.slug}`}
                    key={doc.id}
                    className="group flex flex-col justify-between rounded-2xl border border-border bg-surface/60 p-6 shadow-irisSm hover:shadow-irisMd hover:border-border-strong hover:bg-surface transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-secondary bg-background border border-border px-2.5 py-1 rounded-md truncate max-w-[60%]">
                          {renderDynamicIcon(doc.icon, "size-3.5")}
                          <span className="truncate">{doc.subcategory || "Geral"}</span>
                        </span>
                        
                        <span className="flex items-center gap-1 text-[11px] font-medium text-foreground-muted">
                          <Clock className="size-3" /> {doc.estimated_reading_time || 5} min
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground tracking-[-0.02em] mb-2 group-hover:text-accent transition-colors">
                        {doc.title}
                      </h3>
                      
                      <p className="text-sm text-foreground-secondary line-clamp-2 leading-relaxed">
                        {doc.description || "Nenhuma descrição fornecida para este documento."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-accent">
                      <span>Ler documento completo</span>
                      <ArrowRight className="size-4 transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}