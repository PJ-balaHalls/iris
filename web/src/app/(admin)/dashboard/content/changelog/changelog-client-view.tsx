"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveChangelogAction, deleteChangelogAction } from "@/app/(admin)/dashboard/docs/actions";
import { GitCommit, Plus, Trash2, Edit3, Layers, Clock, Link as LinkIcon, Bold, Italic, List, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export function ChangelogDashboardClientView({ logs = [] }: { logs: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"write" | "preview">("write");

  const [version, setVersion] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<"feature" | "improvement" | "bugfix">("feature");
  const [status, setStatus] = React.useState<"planned" | "developing" | "released">("released");

  React.useEffect(() => {
    if (selectedLog) {
      setVersion(selectedLog.version || "");
      setTitle(selectedLog.title || "");
      setDescription(selectedLog.description || "");
      setCategory(selectedLog.category || "feature");
      setStatus(selectedLog.status || "released");
      setActiveTab("write");
    } else {
      setVersion(""); setTitle(""); setDescription(""); setCategory("feature"); setStatus("released");
    }
  }, [selectedLog]);

  const handleOpenDrawer = (log: any = null) => {
    setSelectedLog(log);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este registro permanentemente?")) return;
    const res = await deleteChangelogAction(id);
    if (res.ok) router.refresh();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await saveChangelogAction({ id: selectedLog?.id, version, title, description, category, status });
    setIsSubmitting(false);
    
    if (res.ok) { setIsOpen(false); router.refresh(); } 
    else alert("Erro ao registrar: " + res.message);
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("changelog-desc") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    setDescription(text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <GitCommit className="size-4" /> Registro Cronológico
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.04em] text-foreground">Changelog & Migrations</h1>
          <p className="text-sm text-foreground-secondary mt-1">Histórico completo de versões e notas de lançamento do ecossistema.</p>
        </div>
        
        <Button onClick={() => handleOpenDrawer(null)} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 px-6 py-2.5 shadow-md w-full sm:w-auto">
          <Plus className="size-5" /> <span>Registrar Lançamento</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border bg-surface/30 rounded-2xl text-foreground-muted">Nenhum log de alteração indexado.</div>
          ) : (
            logs.map((log) => {
              const deeplink = `v-${log.version.replace(/\./g, "-")}`;
              return (
                <div key={log.id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-background border border-border px-2 py-0.5 rounded text-foreground">v{log.version}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${log.category === 'feature' ? 'bg-emerald-500/10 text-emerald-600' : log.category === 'improvement' ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'}`}>{log.category}</span>
                        {log.status === 'released' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 ml-2"><CheckCircle className="size-3" /> Público</span>}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{log.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDrawer(log)} className="h-8 px-3 border-border hover:bg-background text-foreground-secondary"><Edit3 className="size-3.5 mr-1.5" /> Editar</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(log.id)} className="h-8 px-3 border-border text-rose-600 hover:bg-rose-500/10"><Trash2 className="size-3.5 mr-1.5" /> Excluir</Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-foreground-secondary whitespace-pre-wrap pl-2 border-l-2 border-border/50">{log.description}</div>
                  
                  <div className="flex items-center justify-between text-xs text-foreground-muted pt-2 border-t border-border/40">
                    <span className="flex items-center gap-1.5 font-medium"><Clock className="size-3.5" /> {log.released_at ? new Date(log.released_at).toLocaleDateString("pt-BR") : "Sem data"}</span>
                    <Link href={`/docs/changelog#${deeplink}`} target="_blank" className="flex items-center gap-1 hover:text-accent transition-colors">Ver DeepLink <ExternalLink className="size-3" /></Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="hidden lg:block space-y-4 sticky top-24">
          <div className="border border-border bg-surface/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground-muted"><Layers className="size-4 text-blue-500" /> Mapa de Versões</div>
            <div className="space-y-1 text-xs">
              {logs.map(log => (
                <div key={`side-${log.id}`} className="flex justify-between items-center p-2 hover:bg-background rounded-lg font-mono border border-transparent hover:border-border transition-colors">
                  <span className="font-bold text-blue-600">v{log.version}</span>
                  <span className="text-foreground-muted truncate max-w-[130px]">{log.title}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-background border-l border-border p-6 shadow-2xl">
          <SheetHeader className="pb-4 border-b border-border mb-8">
            <SheetTitle className="text-2xl font-bold text-foreground">{selectedLog ? `Editar Registro v${version}` : "Registrar Novo Lançamento"}</SheetTitle>
            <SheetDescription className="text-sm text-foreground-muted">O conteúdo suporta formatação rica em Markdown.</SheetDescription>
          </SheetHeader>

          <form onSubmit={onSubmit} className="space-y-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><label className="text-sm font-semibold text-foreground">Versão</label><Input value={version} onChange={e => setVersion(e.target.value)} required className="font-mono bg-surface" /></div>
              <div className="space-y-2"><label className="text-sm font-semibold text-foreground">Categoria</label><Select value={category} onChange={e => setCategory(e.target.value as any)} options={[{ value: "feature", label: "Nova Feature" }, { value: "improvement", label: "Melhoria" }, { value: "bugfix", label: "Bugfix" }]} /></div>
              <div className="space-y-2"><label className="text-sm font-semibold text-foreground">Visibilidade</label><Select value={status} onChange={e => setStatus(e.target.value as any)} options={[{ value: "planned", label: "Planejado (Interno)" }, { value: "developing", label: "Em Desenvolvimento" }, { value: "released", label: "Lançado (Público)" }]} /></div>
            </div>

            <div className="space-y-2"><label className="text-sm font-semibold text-foreground">Título do Lançamento</label><Input value={title} onChange={e => setTitle(e.target.value)} required className="text-base bg-surface" /></div>

            <div className="space-y-2 border border-border rounded-xl overflow-hidden bg-surface">
              <div className="flex items-center justify-between bg-background border-b border-border px-3 py-2">
                <div className="flex gap-2">
                  <Button type="button" variant={activeTab === "write" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveTab("write")} className="h-7 text-xs">Editor</Button>
                  <Button type="button" variant={activeTab === "preview" ? "secondary" : "ghost"} size="sm" onClick={() => setActiveTab("preview")} className="h-7 text-xs">Preview</Button>
                </div>
                {activeTab === "write" && (
                  <div className="flex items-center gap-1 border-l border-border pl-2">
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("**", "**")}><Bold className="size-3.5" /></Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("*", "*")}><Italic className="size-3.5" /></Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("- ")}><List className="size-3.5" /></Button>
                    <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => insertMarkdown("[Texto](", ")")}><LinkIcon className="size-3.5" /></Button>
                  </div>
                )}
              </div>

              {activeTab === "write" ? (
                <Textarea id="changelog-desc" value={description} onChange={e => setDescription(e.target.value)} rows={12} className="border-0 focus-visible:ring-0 rounded-none bg-transparent resize-y p-4" required />
              ) : (
                <div className="min-h-[260px] p-6 text-sm text-foreground-secondary whitespace-pre-wrap">{description ? description.split("\n").map((line, i) => (<p key={i}>{line.split(/\*\*([\s\S]*?)\*\*/g).map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="text-foreground">{p}</strong> : p)}</p>)) : <span className="text-foreground-muted italic">A pré-visualização aparecerá aqui.</span>}</div>
              )}
            </div>

            <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-end gap-3 mt-8">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium">{isSubmitting ? "Salvando..." : "Salvar Registro"}</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}