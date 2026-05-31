import { Button } from "@/components/ui/button";
import { Loader2, Globe, FileEdit, Trash2, ExternalLink } from "lucide-react";

interface ContentPublishPanelProps {
  status: "draft" | "published" | "archived";
  isSubmitting: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDelete?: () => void;
  previewUrl?: string;
}

export function ContentPublishPanel({ 
  status, 
  isSubmitting, 
  onSaveDraft, 
  onPublish, 
  onDelete,
  previewUrl 
}: ContentPublishPanelProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Publicação</h3>
        {status === "published" ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
            <Globe className="size-3" /> Público
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
            <FileEdit className="size-3" /> Rascunho
          </span>
        )}
      </div>

      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-center bg-background border-border text-foreground-secondary hover:text-foreground"
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          {isSubmitting && status !== "published" ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          Salvar Rascunho
        </Button>
        
        <Button 
          className="w-full justify-center bg-accent hover:bg-accent/90 text-white"
          onClick={onPublish}
          disabled={isSubmitting}
        >
          {isSubmitting && status === "published" ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
          {status === "published" ? "Atualizar Publicação" : "Publicar Agora"}
        </Button>
      </div>

      {(previewUrl || onDelete) && (
        <div className="pt-4 border-t border-border flex items-center justify-between">
          {previewUrl ? (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-foreground-secondary hover:text-accent flex items-center gap-1 transition-colors">
              <ExternalLink className="size-3" /> Preview
            </a>
          ) : <div />}
          
          {onDelete && (
            <button type="button" onClick={onDelete} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors">
              <Trash2 className="size-3" /> Mover para Lixeira
            </button>
          )}
        </div>
      )}
    </div>
  );
}