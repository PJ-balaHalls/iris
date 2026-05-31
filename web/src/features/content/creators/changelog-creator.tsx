"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ContentEditorShell } from "../core/components/content-editor-shell";
import { ContentPublishPanel } from "../core/components/content-publish-panel";
import { ContentBlockEditor } from "../core/components/content-block-editor";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { saveContentEntryAction } from "../actions";
import type { ContentEntry, ChangelogMeta, ContentBlock } from "../types";

export function ChangelogCreator({ initialData }: { initialData?: Partial<ContentEntry<ChangelogMeta>> }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Campos Core
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [summary, setSummary] = React.useState(initialData?.summary || "");
  const [status, setStatus] = React.useState<"draft" | "published">(initialData?.status === "published" ? "published" : "draft");
  const [blocks, setBlocks] = React.useState<ContentBlock[]>(initialData?.blocks || [{ id: "1", type: "paragraph", data: { text: "" } }]);

  // Metadados Específicos do Changelog
  const [version, setVersion] = React.useState(initialData?.metadata?.version || "");
  const [changeType, setChangeType] = React.useState(initialData?.metadata?.changeType || "feature");
  const [severity, setSeverity] = React.useState(initialData?.metadata?.severity || "low");

  const handleSave = async (targetStatus: "draft" | "published") => {
    setIsSubmitting(true);
    setStatus(targetStatus);

    const res = await saveContentEntryAction({
      id: initialData?.id,
      type: "changelog",
      title,
      summary,
      status: targetStatus,
      blocks,
      metadata: { version, changeType, severity, productArea: "core" } as ChangelogMeta,
    });

    setIsSubmitting(false);

    if (res.ok) {
      router.push("/dashboard/content/changelog");
    } else {
      alert("Erro ao salvar: " + res.message);
    }
  };

  const sidebar = (
    <div className="space-y-6">
      <ContentPublishPanel 
        status={status} 
        isSubmitting={isSubmitting} 
        onSaveDraft={() => handleSave("draft")} 
        onPublish={() => handleSave("published")} 
      />

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Configuração da Versão</h3>
        
        <Input 
          label="Versão Semântica" 
          placeholder="Ex: 1.2.0" 
          value={version} 
          onChange={e => setVersion(e.target.value)} 
          className="font-mono bg-background" 
        />
        
        <Select 
          label="Tipo de Alteração" 
          value={changeType} 
          onChange={e => setChangeType(e.target.value as any)}
          options={[
            { value: "feature", label: "Nova Feature" },
            { value: "improvement", label: "Melhoria" },
            { value: "fix", label: "Bugfix" },
            { value: "security", label: "Segurança" }
          ]}
        />

        <Select 
          label="Severidade / Impacto" 
          value={severity} 
          onChange={e => setSeverity(e.target.value as any)}
          options={[
            { value: "low", label: "Baixo (Transparente)" },
            { value: "medium", label: "Médio" },
            { value: "high", label: "Alto" },
            { value: "critical", label: "Crítico (Breaking Change)" }
          ]}
        />
      </div>
    </div>
  );

  return (
    <ContentEditorShell 
      title={title || "Nova Versão Não Salva"} 
      backHref="/dashboard/content/changelog"
      badgeLabel="Changelog"
      badgeColor="text-blue-500"
      sidebar={sidebar}
    >
      {/* Campos de Título e Resumo da Entrada */}
      <div className="space-y-6 bg-transparent">
        <Input 
          placeholder="Título do Lançamento..." 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          className="text-4xl md:text-5xl font-bold tracking-[-0.04em] border-0 bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-foreground-muted" 
        />
        <Input 
          placeholder="Um resumo de uma linha (Aparece no card público)..." 
          value={summary} 
          onChange={e => setSummary(e.target.value)} 
          className="text-lg text-foreground-secondary border-0 bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-foreground-muted" 
        />
      </div>

      <div className="h-px w-full bg-border" />

      {/* Editor de Blocos Avançado */}
      <ContentBlockEditor blocks={blocks} onChange={setBlocks} />
      
    </ContentEditorShell>
  );
}