// web/src/components/admin/docs/markdown-editor.tsx
"use client";

import * as React from "react";
import { Bold, Code, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Quote } from "lucide-react";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function MarkdownEditor({ value, onChange, error }: MarkdownEditorProps) {
  const [mode, setMode] = React.useState<"write" | "preview">("write");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, label: "Negrito", onClick: () => insertText("**", "**") },
    { icon: Italic, label: "Itálico", onClick: () => insertText("_", "_") },
    { icon: LinkIcon, label: "Link", onClick: () => insertText("[", "](url)") },
    { icon: ImageIcon, label: "Imagem", onClick: () => insertText("![descrição](", ")") },
    { icon: Code, label: "Código", onClick: () => insertText("\`\`\`\n", "\n\`\`\`") },
    { icon: Quote, label: "Citação", onClick: () => insertText("> ") },
    { icon: List, label: "Lista", onClick: () => insertText("- ") },
    { icon: ListOrdered, label: "Lista numerada", onClick: () => insertText("1. ") },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-[#E0DDD6] bg-white shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
      <div className="flex items-center justify-between border-b border-[#E0DDD6] px-3 py-2 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn, i) => (
            <button
              key={i}
              type="button"
              onClick={btn.onClick}
              title={btn.label}
              disabled={mode === "preview"}
              className="grid size-8 place-items-center rounded-lg text-[#666666] transition hover:bg-[#FAF7F2] hover:text-[#111111] disabled:opacity-30 dark:text-[#A0A0A0] dark:hover:bg-white/5 dark:hover:text-[#FAF7F2]"
            >
              <btn.icon className="size-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg bg-[#FAF7F2] p-1 dark:bg-[#111111]">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={"rounded-md px-3 py-1 text-xs font-medium transition " + (mode === "write" ? "bg-white text-[#111111] shadow-sm dark:bg-[#2A2A2A] dark:text-white" : "text-[#8A8A8A] hover:text-[#111111] dark:hover:text-white")}
          >
            Escrever
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={"rounded-md px-3 py-1 text-xs font-medium transition " + (mode === "preview" ? "bg-white text-[#111111] shadow-sm dark:bg-[#2A2A2A] dark:text-white" : "text-[#8A8A8A] hover:text-[#111111] dark:hover:text-white")}
          >
            Preview
          </button>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {mode === "write" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Escreva o conteúdo em Markdown aqui..."
            className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-[#111111] outline-none dark:text-[#FAF7F2]"
          />
        ) : (
          <div className="prose prose-sm prose-zinc absolute inset-0 h-full w-full overflow-y-auto p-4 dark:prose-invert prose-headings:font-semibold prose-a:text-[#006D4E]">
            {value ? (
              <div dangerouslySetContent={{ __html: "<p className='text-xs text-[#8A8A8A] italic'>O preview real processará o markdown na página final. Para este painel, mostramos apenas a estrutura base.</p><pre className='mt-4 whitespace-pre-wrap'>" + value + "</pre>" }} />
            ) : (
              <p className="text-[#8A8A8A]">Nada para visualizar.</p>
            )}
          </div>
        )}
      </div>
      {error && <p className="px-4 pb-3 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
