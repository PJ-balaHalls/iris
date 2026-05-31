import { renderDynamicIcon } from "@/lib/utils/icons-map";
import { Clock, Tag, Download, Link2, AlertCircle } from "lucide-react";

export function DocRenderer({ article }: { article: any }) {
  // Evita erro se o metadata ou o content estiverem nulos no banco
  const meta = typeof article.metadata === "string" ? JSON.parse(article.metadata) : article.metadata || {};
  const tags: string[] = meta.tags || [];
  const attachments = meta.attachments || [];
  const coverUrl = meta.cover_url || null;

  const content = article.content || "";
  const lines = content.split("\n");

  // Gerador de TOC (Table of Contents)
  const headings = lines
    .filter((line: string) => line.startsWith("## "))
    .map((line: string) => {
      const title = line.replace("## ", "").trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return { title, id };
    });

  return (
    <article className="w-full max-w-[var(--layout-page-max)] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 px-6 md:px-10">
      <div className="space-y-8 min-w-0">
        
        {coverUrl && (
          <div className="w-full h-[320px] rounded-2xl overflow-hidden border border-border relative bg-surface/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-surface text-xs font-medium text-foreground-secondary">
              {renderDynamicIcon(article.icon, "size-3.5 text-accent")}
              {article.subcategory || article.category}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-md">
              {article.complexity === "advanced" ? "Avançado" : article.complexity === "intermediate" ? "Intermediário" : "Iniciante"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-[-0.04em] text-foreground leading-[1.1]">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-lg text-foreground-secondary font-medium leading-relaxed border-l-2 border-border pl-4">
              {article.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-6 pt-2 border-b border-border pb-6 text-sm text-foreground-muted">
            {article.author?.full_name && (
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold uppercase">
                  {article.author.full_name.charAt(0)}
                </div>
                <span className="font-medium text-foreground-secondary">{article.author.full_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <span>{article.estimated_reading_time || 5} min de leitura</span>
            </div>
            <div>
              Atualizado em {new Date(article.updated_at).toLocaleDateString("pt-BR")}
            </div>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base max-w-none text-foreground-secondary space-y-6 leading-relaxed">
          {content === "" && (
            <div className="italic opacity-50 p-4 border border-dashed rounded-lg">
              Este documento não possui corpo de texto.
            </div>
          )}

          {lines.map((line: string, idx: number) => {
            if (line.startsWith("## ")) {
              const text = line.replace("## ", "").trim();
              const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              return (
                <h2 key={idx} id={id} className="text-2xl font-bold text-foreground tracking-[-0.02em] pt-6 flex items-center gap-2 group scroll-mt-24">
                  {text}
                  <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground-muted"><Link2 className="size-4" /></a>
                </h2>
              );
            }
            if (line.startsWith("### ")) return <h3 key={idx} className="text-xl font-semibold text-foreground pt-4">{line.replace("### ", "").trim()}</h3>;
            if (line.startsWith("> ")) return (
              <blockquote key={idx} className="bg-surface/50 border-l-4 border-accent p-4 rounded-r-xl my-4 text-foreground flex items-start gap-3">
                <AlertCircle className="size-5 text-accent shrink-0 mt-0.5" />
                <p className="italic m-0">{line.replace("> ", "").trim()}</p>
              </blockquote>
            );
            if (line.trim() === "") return <div key={idx} className="h-2" />;
            
            const parts = line.split(/\*\*([\s\S]*?)\*\*/g);
            return (
              <p key={idx} className="text-base">
                {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-foreground">{part}</strong> : part)}
              </p>
            );
          })}
        </div>

        {attachments.length > 0 && (
          <div className="mt-12 p-6 border border-border bg-surface/30 rounded-2xl">
            <h4 className="text-base font-semibold text-foreground mb-4">Arquivos e Anexos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((file: any, index: number) => (
                <a key={index} href={file.url} download className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:bg-surface transition group">
                  <div className="flex items-center gap-3 min-w-0">
                    <Download className="size-4 text-foreground-muted group-hover:text-accent transition-colors" />
                    <div className="truncate">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      {file.size && <p className="text-[10px] text-foreground-muted">{file.size}</p>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="hidden lg:block space-y-8 sticky top-28 self-start">
        {headings.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground-muted">Neste Caderno</p>
            <nav className="flex flex-col gap-2.5 border-l border-border pl-0">
              {headings.map((heading: any) => (
                <a key={heading.id} href={`#${heading.id}`} className="text-sm text-foreground-secondary hover:text-accent border-l border-transparent pl-4 -ml-[1px] hover:border-accent transition-all block truncate">
                  {heading.title}
                </a>
              ))}
            </nav>
          </div>
        )}
      </aside>
    </article>
  );
}