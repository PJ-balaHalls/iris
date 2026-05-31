"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { renderDynamicIcon } from "@/lib/utils/icons-map";
import { Plus, Trash2, Edit3, BarChart3, FileText, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";
import { ArticleForm } from "@/components/admin/docs/article-form";
import { deleteArticleAction } from "@/app/(admin)/dashboard/docs/actions";

interface ArticlesManagementViewProps {
  title: string;
  description: string;
  category: "guide" | "api" | "legal" | "blog" | "community";
  defaultSubcategory?: string;
  articles: any[];
  badgeColor: string;
}

export function ArticlesManagementView({ 
  title, 
  description, 
  category, 
  defaultSubcategory = "", 
  articles = [], 
  badgeColor 
}: ArticlesManagementViewProps) {
  const router = useRouter();
  
  // Estados de controle da interface
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedArticle, setSelectedArticle] = React.useState<any | undefined>(undefined);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  // Insights Dinâmicos
  const totalDocs = articles.length;
  const publishedDocs = articles.filter(a => a.is_published).length;
  const draftDocs = totalDocs - publishedDocs;

  // Ações
  const handleEdit = (article: any) => {
    setSelectedArticle(article);
    setIsDrawerOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedArticle({
      category: category,
      subcategory: defaultSubcategory,
      icon: "BookOpen",
      complexity: "beginner",
      estimated_reading_time: 5,
      is_published: false
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este documento permanentemente do acervo?")) return;
    
    setIsDeleting(id);
    try {
      const res = await deleteArticleAction(id);
      if (!res.ok) {
        alert("Falha ao remover: " + res.message);
      } else {
        router.refresh(); // Atualiza a página com o novo estado do banco
      }
    } catch (error) {
      alert("Erro ao executar ação de exclusão.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
      {/* 1. Cabeçalho Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${badgeColor} mb-1`}>
            <ShieldAlert className="size-4" /> Painel Operacional IRÍS
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground">{title}</h1>
          <p className="text-sm text-foreground-secondary mt-1">{description}</p>
        </div>
        
        <Button onClick={handleCreateNew} className="rounded-full bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-2 px-5 py-2.5 shadow-sm">
          <Plus className="size-4" /> Novo Caderno
        </Button>
      </div>

      {/* 2. Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border border-border bg-surface rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-accent/10 text-accent rounded-xl"><FileText className="size-5" /></div>
          <div>
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total em Acervo</p>
            <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
          </div>
        </div>
        <div className="p-5 border border-border bg-surface rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle className="size-5" /></div>
          <div>
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Publicados / Ativos</p>
            <p className="text-2xl font-bold text-emerald-600">{publishedDocs}</p>
          </div>
        </div>
        <div className="p-5 border border-border bg-surface rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl"><AlertCircle className="size-5" /></div>
          <div>
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Rascunhos / Internos</p>
            <p className="text-2xl font-bold text-amber-600">{draftDocs}</p>
          </div>
        </div>
      </div>

      {/* 3. Listagem de Artigos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="size-4 text-foreground-muted" /> Cadernos Encontrados
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border bg-surface/30 rounded-2xl text-foreground-muted">
            Nenhum caderno estruturado nesta seção. Clique em "Novo Caderno" para iniciar.
          </div>
        ) : (
          <div className="border border-border rounded-2xl divide-y divide-border bg-surface overflow-hidden shadow-sm">
            {articles.map((art) => (
              <div key={art.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 border border-border bg-background rounded-xl text-foreground-muted shrink-0 flex items-center justify-center">
                    {renderDynamicIcon(art.icon, "size-5 text-accent") || <FileText className="size-5 text-accent" />}
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-foreground truncate">{art.title}</h3>
                    <p className="text-xs text-foreground-muted truncate mt-0.5 font-medium">
                      {art.subcategory || "Sem subcategoria"} • {art.complexity} • {art.estimated_reading_time} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${art.is_published ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {art.is_published ? "Publicado" : "Rascunho"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(art)} 
                      className="h-8 px-3 text-foreground-secondary border-border hover:bg-background"
                    >
                      <Edit3 className="size-3.5 mr-1" /> Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={isDeleting === art.id} 
                      onClick={() => handleDelete(art.id)} 
                      className="h-8 px-3 border-border text-rose-600 hover:bg-rose-500/10"
                    >
                      <Trash2 className="size-3.5 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Drawer de Edição / Criação (Sheet Lateral) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-background border-l border-border p-6 shadow-2xl">
          <SheetHeader className="pb-4 border-b border-border mb-6">
            <SheetTitle className="text-xl font-bold text-foreground">
              {selectedArticle?.id ? "Modificar Caderno" : "Adicionar Novo Registro"}
            </SheetTitle>
            <SheetDescription className="text-sm text-foreground-muted">
              Preencha os metadados e o conteúdo. As alterações refletem no painel admin e nas views públicas se o status for publicado.
            </SheetDescription>
          </SheetHeader>

          {/* Renderiza o form original. Como o seu ArticleForm redireciona a página em caso de sucesso 
              (no arquivo enviado, ele tem router.push("/dashboard/docs")), ao salvar o Drawer será desmontado naturalmente */}
          {isDrawerOpen && (
             <div className="pb-10">
               <ArticleForm initialData={selectedArticle} />
             </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}