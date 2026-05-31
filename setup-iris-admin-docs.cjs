#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const startedAt = new Date();

function exists(p) {
  return fs.existsSync(p);
}

function resolveWebRoot() {
  if (exists(path.join(root, "web", "src", "app"))) return path.join(root, "web");
  if (exists(path.join(root, "src", "app")) && exists(path.join(root, "package.json"))) return root;
  throw new Error("Execute este setup na raiz do monorepo IRIS ou dentro da pasta web.");
}

const webRoot = resolveWebRoot();
const repoRoot = path.basename(webRoot) === "web" ? path.dirname(webRoot) : webRoot;
const backupRoot = path.join(
  repoRoot,
  ".iris-backups",
  "admin-docs-editor-" + startedAt.toISOString().replace(/[:.]/g, "-")
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeWebFile(relativePath, content) {
  const absPath = path.join(webRoot, relativePath);
  const normalized = content.trimStart().replace(/\s+$/g, "") + "\n";

  ensureDir(path.dirname(absPath));

  if (exists(absPath) && fs.readFileSync(absPath, "utf8") !== normalized) {
    const backupPath = path.join(backupRoot, relativePath);
    ensureDir(path.dirname(backupPath));
    fs.copyFileSync(absPath, backupPath);
  }

  fs.writeFileSync(absPath, normalized, "utf8");
  console.log("+ escrito:", relativePath);
}

writeWebFile("src/schemas/docs.schema.ts", String.raw`
// web/src/schemas/docs.schema.ts
import { z } from "zod";

export const docsCategorySchema = z.enum(["guide", "api", "legal", "blog", "community"]);
export const docsComplexitySchema = z.enum(["beginner", "intermediate", "advanced"]);

export const articleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "O título precisa ter pelo menos 3 caracteres."),
  slug: z
    .string()
    .min(3, "O slug precisa ter pelo menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "O slug deve conter apenas letras minúsculas, números e hifens."),
  description: z.string().max(300, "A descrição deve ter no máximo 300 caracteres.").optional(),
  content: z.string().min(10, "O conteúdo não pode estar vazio."),
  category: docsCategorySchema,
  subcategory: z.string().optional(),
  icon: z.string().optional(),
  complexity: docsComplexitySchema.default("beginner"),
  estimated_reading_time: z.number().min(1, "Tempo mínimo é 1 minuto.").max(120),
  is_published: z.boolean().default(false),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
`);

writeWebFile("src/components/ui/icon-picker.tsx", String.raw`
// web/src/components/ui/icon-picker.tsx
"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Uma seleção curada de ícones úteis para documentação
const COMMON_ICONS = [
  "Book", "BookOpen", "Terminal", "TerminalSquare", "Code", "Braces", 
  "Database", "Server", "Globe", "Shield", "ShieldCheck", "Lock", "Unlock", 
  "Key", "Zap", "Sparkles", "Star", "Flame", "Droplet", "Leaf", "Sprout", 
  "Settings", "Cog", "Wrench", "Hammer", "Users", "User", "Building2", 
  "Briefcase", "Scale", "FileText", "Files", "Folder", "FolderOpen", 
  "MessageSquare", "MessageCircle", "Bell", "Inbox", "Send", "CreditCard", 
  "Wallet", "Banknote", "Coins", "LineChart", "PieChart", "BarChart", 
  "Activity", "AlertCircle", "AlertTriangle", "Info", "HelpCircle"
];

type IconPickerProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
};

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredIcons = React.useMemo(() => {
    if (!search) return COMMON_ICONS;
    return COMMON_ICONS.filter(name => name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  // @ts-ignore
  const SelectedIcon = value && LucideIcons[value] ? LucideIcons[value] : LucideIcons.FileText;

  return (
    <div className="relative flex flex-col gap-2">
      {label && <label className="text-xs font-medium text-[#444444] dark:text-[#C0C0C0]">{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-[#E0DDD6] bg-white px-3 py-2 text-sm text-[#111111] transition hover:border-[#006D4E]/50 dark:border-[#2A2A2A] dark:bg-[#1C1C1C] dark:text-[#FAF7F2]"
      >
        <div className="flex items-center gap-2">
          <SelectedIcon className="size-4 text-[#006D4E]" />
          <span>{value || "Selecione um ícone"}</span>
        </div>
        <ChevronDown className="size-4 text-[#8A8A8A]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] z-50 flex w-full max-w-[280px] flex-col overflow-hidden rounded-2xl border border-[#E0DDD6] bg-white shadow-xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
            <div className="border-b border-[#E0DDD6] p-2 dark:border-[#2A2A2A]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  type="text"
                  placeholder="Buscar ícone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg bg-[#FAF7F2] py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-[#006D4E]/20 dark:bg-[#111111] dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid max-h-48 grid-cols-5 gap-2 overflow-y-auto p-2">
              {filteredIcons.map((iconName) => {
                // @ts-ignore
                const IconCmp = LucideIcons[iconName];
                if (!IconCmp) return null;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    title={iconName}
                    className="grid aspect-square place-items-center rounded-xl border border-transparent text-[#666666] transition hover:border-[#006D4E]/20 hover:bg-[#006D4E]/5 hover:text-[#006D4E] dark:text-[#A0A0A0]"
                  >
                    <IconCmp className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
`);

writeWebFile("src/components/admin/docs/markdown-editor.tsx", String.raw`
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
`);

writeWebFile("src/app/dashboard/docs/editor/actions.ts", String.raw`
// web/src/app/dashboard/docs/editor/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerAdminClient } from "@/lib/supabase/server-admin";
import { articleSchema, type ArticleFormValues } from "@/schemas/docs.schema";

export async function saveArticleAction(data: ArticleFormValues) {
  const supabase = createSupabaseServerAdminClient();
  if (!supabase) return { ok: false, message: "Erro interno no servidor." };

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { ok: false, message: "Não autenticado." };

  const parsed = articleSchema.safeParse(data);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const payload = parsed.data;

  // Verifica unicidade do slug se for um novo post ou se mudou o slug
  if (!payload.id) {
    const { count } = await supabase
      .from("docs_articles")
      .select("id", { count: "exact", head: true })
      .eq("slug", payload.slug);
      
    if (count && count > 0) return { ok: false, message: "Este slug já está em uso." };
  }

  const { data: saved, error } = await supabase
    .from("docs_articles")
    .upsert({
      id: payload.id || undefined,
      slug: payload.slug,
      title: payload.title,
      description: payload.description || null,
      content: payload.content,
      category: payload.category,
      subcategory: payload.subcategory || null,
      icon: payload.icon || null,
      complexity: payload.complexity,
      estimated_reading_time: payload.estimated_reading_time,
      is_published: payload.is_published,
      author_id: authData.user.id,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[SAVE_DOCS_ERROR]", error);
    return { ok: false, message: "Falha ao salvar o documento no banco de dados." };
  }

  revalidatePath("/docs");
  revalidatePath("/dashboard/docs");

  return { ok: true, id: saved.id };
}
`);

writeWebFile("src/components/admin/docs/article-form.tsx", String.raw`
// web/src/components/admin/docs/article-form.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { articleSchema, type ArticleFormValues } from "@/schemas/docs.schema";
import { saveArticleAction } from "@/app/dashboard/docs/editor/actions";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/ui/icon-picker";
import { MarkdownEditor } from "@/components/admin/docs/markdown-editor";

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ArticleForm({ initialData }: { initialData?: Partial<ArticleFormValues> }) {
  const router = useRouter();
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      category: initialData?.category || "guide",
      subcategory: initialData?.subcategory || "",
      icon: initialData?.icon || "BookOpen",
      complexity: initialData?.complexity || "beginner",
      estimated_reading_time: initialData?.estimated_reading_time || 5,
      is_published: initialData?.is_published ?? false,
      id: initialData?.id,
    },
  });

  const title = watch("title");
  const category = watch("category");
  const slug = watch("slug");

  // Autogerar slug ao digitar o título (apenas se for novo)
  React.useEffect(() => {
    if (!initialData?.id && title) {
      setValue("slug", slugify(title), { shouldValidate: true });
    }
  }, [title, initialData?.id, setValue]);

  async function onSubmit(data: ArticleFormValues) {
    setGlobalError(null);
    const result = await saveArticleAction(data);
    
    if (!result.ok) {
      setGlobalError(result.message);
      return;
    }

    router.push("/dashboard/docs");
    router.refresh();
  }

  const previewLink = "iris.com/docs/" + category + "/" + (slug || "novo-artigo");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Header com Ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#E0DDD6] bg-white p-5 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
        <div>
          <h1 className="text-xl font-semibold text-[#111111] dark:text-[#FAF7F2]">
            {initialData?.id ? "Editar Documento" : "Criar Novo Documento"}
          </h1>
          <a href={"https://" + previewLink} target="_blank" className="mt-1 flex items-center gap-1 text-xs text-[#006D4E] hover:underline">
            {previewLink} <ExternalLink className="size-3" />
          </a>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-[#444444] dark:text-[#C0C0C0]">
            <input type="checkbox" {...register("is_published")} className="rounded border-[#E0DDD6] text-[#006D4E] focus:ring-[#006D4E]" />
            Publicar
          </label>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4" /> Salvar</>}
          </Button>
        </div>
      </div>

      {globalError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {globalError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Lado Esquerdo: Editor Principal */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-[#E0DDD6] bg-white p-6 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
            <Input
              label="Título do Artigo"
              placeholder="Ex: Como configurar Webhooks"
              error={errors.title?.message}
              {...register("title")}
            />
            
            <Input
              label="Subtítulo / Descrição (Opcional)"
              placeholder="Um resumo claro que aparecerá nos cards e na busca."
              error={errors.description?.message}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#111111] dark:text-[#FAF7F2]">Corpo do Documento</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <MarkdownEditor value={field.value} onChange={field.onChange} error={errors.content?.message} />
              )}
            />
          </div>
        </div>

        {/* Lado Direito: Metadados */}
        <div className="space-y-6">
          <div className="space-y-5 rounded-3xl border border-[#E0DDD6] bg-white p-6 shadow-sm dark:border-[#2A2A2A] dark:bg-[#1C1C1C]">
            <h3 className="text-sm font-semibold text-[#111111] dark:text-[#FAF7F2]">Organização e Metadados</h3>
            
            <Select
              label="Categoria"
              options={[
                { value: "guide", label: "Guias e Tutoriais" },
                { value: "api", label: "Referência de API" },
                { value: "legal", label: "Legal e Compliance" },
                { value: "blog", label: "Blog" },
                { value: "community", label: "Comunidade" },
              ]}
              {...register("category")}
            />

            <Input
              label="Subcategoria (Opcional)"
              placeholder="Ex: Autenticação"
              {...register("subcategory")}
            />

            <Input
              label="Slug da URL"
              placeholder="como-configurar-webhooks"
              error={errors.slug?.message}
              {...register("slug")}
            />

            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <IconPicker label="Ícone de Destaque" value={field.value} onChange={field.onChange} />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Complexidade"
                options={[
                  { value: "beginner", label: "Iniciante" },
                  { value: "intermediate", label: "Intermediário" },
                  { value: "advanced", label: "Avançado" },
                ]}
                {...register("complexity")}
              />

              <Input
                label="Tempo (min)"
                type="number"
                min="1"
                error={errors.estimated_reading_time?.message}
                {...register("estimated_reading_time", { valueAsNumber: true })}
              />
            </div>
          </div>
          
          <div className="rounded-3xl border border-[#006D4E]/20 bg-[#006D4E]/5 p-5 text-sm leading-6 text-[#183A2E] dark:bg-[#006D4E]/10 dark:text-[#BDE8D7]">
            <strong>Dica de Markdown:</strong> Use <code>##</code> para títulos de seção, <code>[texto](url)</code> para links de apoio, e <code>![alt](url_da_imagem)</code> para inserir capturas de tela vindas do seu storage ou CDN.
          </div>
        </div>
      </div>
    </form>
  );
}
`);

writeWebFile("src/app/dashboard/docs/editor/page.tsx", String.raw`
// web/src/app/dashboard/docs/editor/page.tsx
import { ArticleForm } from "@/components/admin/docs/article-form";

export const dynamic = "force-dynamic";

export default function DocsEditorPage() {
  // Num cenário real, você buscaria os dados do banco aqui caso houvesse um ?id= na URL
  // para permitir a edição de documentos existentes.
  
  return (
    <div className="mx-auto max-w-7xl">
      <ArticleForm />
    </div>
  );
}
`);

const packagePath = path.join(webRoot, "package.json");
if (exists(packagePath) && process.env.IRIS_SKIP_TYPECHECK !== "1") {
  console.log("\nExecutando typecheck...");
  const result = spawnSync("npm", ["run", "typecheck"], { cwd: webRoot, stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\nSetup do Editor de Docs concluído.");
