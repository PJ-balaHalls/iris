"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { articleSchema, type ArticleFormValues } from "@/schemas/docs.schema";
// IMPORTANTE: Ajuste este import para apontar para o local correto da Action que criamos
import { saveArticleAction } from "@/app/(admin)/dashboard/docs/actions";
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

interface ArticleFormProps {
  initialData?: any;
  onSuccess?: () => void; // A propriedade mágica que fecha o Drawer
}

export function ArticleForm({ initialData, onSuccess }: ArticleFormProps) {
  const [globalError, setGlobalError] = React.useState<string | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      id: initialData?.id,
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
      author_id: initialData?.author_id || "", // Novo campo de autoria
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const isPublished = watch("is_published");

  // Autogerar slug ao digitar o título (apenas se for novo)
  React.useEffect(() => {
    if (!initialData?.id && title) {
      setValue("slug", slugify(title), { shouldValidate: true });
    }
  }, [title, initialData?.id, setValue]);

  async function onSubmit(data: any) {
    setGlobalError(null);
    const result = await saveArticleAction(data);
    
    if (!result.ok) {
      setGlobalError(result.message);
      return;
    }

    // Se a função onSuccess foi passada (pelo Sheet/Drawer), nós a chamamos para fechá-lo!
    if (onSuccess) {
      onSuccess();
    }
  }

  // Link corrigido para o ambiente local e produção de forma relativa
  const previewLink = `/docs/${slug || "novo-artigo"}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      
      {/* Header com Ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {initialData?.id ? "Editar Documento" : "Criar Novo Documento"}
          </h2>
          {isPublished ? (
            <a href={previewLink} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-xs text-accent hover:underline">
              Abrir visualização pública <ExternalLink className="size-3" />
            </a>
          ) : (
            <p className="mt-1 text-xs text-amber-600 font-medium">Este documento está como rascunho (Não será visível no site público).</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
            <input type="checkbox" {...register("is_published")} className="rounded border-border text-accent focus:ring-accent size-4" />
            Publicar
          </label>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px] bg-accent text-white hover:bg-accent/90">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-2" /> Salvar</>}
          </Button>
        </div>
      </div>

      {globalError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {globalError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Lado Esquerdo: Editor Principal */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <Input
              label="Título do Artigo"
              placeholder="Ex: Como configurar Webhooks"
              error={errors.title?.message as string}
              {...register("title")}
            />
            
            <Input
              label="Subtítulo / Descrição (Opcional)"
              placeholder="Um resumo claro que aparecerá nos cards e na busca."
              error={errors.description?.message as string}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Corpo do Documento</label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <MarkdownEditor value={field.value} onChange={field.onChange} error={errors.content?.message as string} />
              )}
            />
          </div>
        </div>

        {/* Lado Direito: Metadados */}
        <div className="space-y-6">
          <div className="space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Organização e Autoria</h3>

            {/* SELETOR DE AUTOR */}
            <Select
              label="Publicar em nome de:"
              options={[
                { value: "", label: "Meu Perfil (Logado)" },
                { value: "00000000-0000-4000-a000-000000000000", label: "Equipe Iris Social (Oficial)" },
              ]}
              {...register("author_id")}
            />
            
            <Select
              label="Categoria"
              options={[
                { value: "guide", label: "Guias e Tutoriais" },
                { value: "api", label: "Referência de API" },
                { value: "legal", label: "Legal e Compliance" },
                { value: "community", label: "Comunidade" },
              ]}
              {...register("category")}
            />

            <Input label="Subcategoria (Opcional)" placeholder="Ex: Autenticação" {...register("subcategory")} />

            <Input label="Slug da URL" placeholder="exemplo-de-slug" error={errors.slug?.message as string} {...register("slug")} />

            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <IconPicker label="Ícone de Destaque" value={field.value} onChange={field.onChange} />
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Nível"
                options={[{ value: "beginner", label: "Iniciante" }, { value: "intermediate", label: "Intermediário" }, { value: "advanced", label: "Avançado" }]}
                {...register("complexity")}
              />

              <Input label="Tempo (min)" type="number" min="1" error={errors.estimated_reading_time?.message as string} {...register("estimated_reading_time", { valueAsNumber: true })} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}