import * as React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ContentEditorShellProps {
  title: string;
  backHref: string;
  badgeLabel?: string;
  badgeColor?: string;
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export function ContentEditorShell({ 
  title, 
  backHref, 
  badgeLabel = "Editor", 
  badgeColor = "text-accent", 
  children, 
  sidebar 
}: ContentEditorShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Topbar do Editor */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="p-2 -ml-2 rounded-full hover:bg-surface-hover text-foreground-secondary transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeColor} bg-background border border-border px-2 py-0.5 rounded-md`}>
              {badgeLabel}
            </span>
            <h1 className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
              {title}
            </h1>
          </div>
        </div>
      </header>

      {/* Workspace de duas colunas */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 p-6 lg:p-8 items-start">
        
        {/* Área Principal: Campos Dinâmicos e Editor de Blocos */}
        <main className="w-full min-w-0 space-y-8 pb-24">
          {children}
        </main>

        {/* Sidebar: Metadados, SEO, Configuração de Capa e Publicação */}
        <aside className="w-full space-y-6 sticky top-24 pb-24">
          {sidebar}
        </aside>
        
      </div>
    </div>
  );
}