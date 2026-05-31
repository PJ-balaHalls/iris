"use server";

import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { articleSchema } from "@/schemas/docs.schema";
import { revalidatePath } from "next/cache";

// Função utilitária para gerar slug amigável e único
function generateUniqueSlug(title: string) {
  const baseSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-")     // Troca espaços e caracteres especiais por hífen
    .replace(/(^-|-$)+/g, "");       // Remove hifens sobrando nas pontas
  
  const uniqueHash = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${uniqueHash}`;
}

// ------------------------------------------------------------------
// 1. AÇÕES DE ARTIGOS (Guias, API, Moderação, Design System)
// ------------------------------------------------------------------

export async function saveArticleAction(data: any) {
  try {
    const supabase = await createSupabaseServerComponentClient();
    if (!supabase) return { ok: false, message: "Erro de conexão com o banco de dados." };

    // Extrai o autor escolhido no form antes da validação do Zod
    const customAuthorId = data.author_id;

    // Se o slug vier vazio, gera um a partir do título
    if (!data.slug || data.slug.trim() === "") {
      data.slug = generateUniqueSlug(data.title || "documento-sem-titulo");
    }

    // Valida os dados usando o seu Zod Schema
    const parsed = articleSchema.safeParse(data);
    if (!parsed.success) {
      console.error(parsed.error);
      return { ok: false, message: "Dados do formulário inválidos. Verifique os campos." };
    }

    const { id, ...values } = parsed.data;
    const { data: { user } } = await supabase.auth.getUser();

    // Define quem é o autor final (O escolhido no form ou o usuário logado como fallback)
    const finalAuthorId = customAuthorId || user?.id;

    let result;

    if (id) {
      // É uma ATUALIZAÇÃO (Update)
      result = await supabase
        .from("docs_articles")
        .update({ 
          ...values, 
          author_id: finalAuthorId, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", id)
        .select();
        
      // Tratativa: se o usuário tentar editar e colocar um slug que já existe em OUTRO artigo
      if (result.error && result.error.code === '23505') {
        const fallbackSlug = generateUniqueSlug(values.title);
        result = await supabase
          .from("docs_articles")
          .update({ 
            ...values, 
            slug: fallbackSlug, 
            author_id: finalAuthorId, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", id)
          .select();
      }
    } else {
      // É uma CRIAÇÃO (Insert)
      result = await supabase
        .from("docs_articles")
        .insert({ 
          ...values, 
          author_id: finalAuthorId 
        })
        .select();
        
      // Tratativa: se der conflito de slug duplicado na criação
      if (result.error && result.error.code === '23505') {
        const fallbackSlug = generateUniqueSlug(values.title);
        result = await supabase
          .from("docs_articles")
          .insert({ 
            ...values, 
            slug: fallbackSlug, 
            author_id: finalAuthorId 
          })
          .select();
      }
    }

    if (result.error) {
      return { ok: false, message: result.error.message };
    }

    // Gravação no Log de Auditoria do IRÍS
    await supabase.from("botanic_identity_audit_logs").insert({
      actor_user_id: user?.id,
      target_user_id: user?.id,
      action: id ? "docs.article.update" : "docs.article.create",
      after_payload: result.data?.[0],
      reason: `Documento "${values.title}" processado via painel admin.`
    });

    // Revalida o cache para o admin e para a área pública
    revalidatePath("/dashboard/docs", "layout");
    revalidatePath("/docs", "layout");
    
    return { ok: true };
  } catch (err: any) {
    console.error("Erro interno:", err);
    return { ok: false, message: err.message || "Erro interno no servidor." };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    const supabase = await createSupabaseServerComponentClient();
    if (!supabase) return { ok: false, message: "Erro de conexão." };

    const { data: { user } } = await supabase.auth.getUser();
    
    // Pega o título do artigo antes de excluir para salvar no log
    const { data: article } = await supabase
      .from("docs_articles")
      .select("title")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("docs_articles")
      .delete()
      .eq("id", id);
    
    if (error) return { ok: false, message: error.message };

    // Grava a exclusão no Log de Auditoria
    await supabase.from("botanic_identity_audit_logs").insert({
      actor_user_id: user?.id,
      target_user_id: user?.id,
      action: "docs.article.delete",
      reason: `Remoção permanente do documento de ID: ${id} (${article?.title || "Desconhecido"})`
    });

    revalidatePath("/dashboard/docs", "layout");
    revalidatePath("/docs", "layout");
    
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

// ------------------------------------------------------------------
// 2. AÇÕES DE CHANGELOG E MIGRATIONS
// ------------------------------------------------------------------

export async function saveChangelogAction(data: { 
  id?: string; 
  version: string; 
  title: string; 
  description: string; 
  category: "feature" | "improvement" | "bugfix"; 
  status: "planned" | "developing" | "released"; 
  released_at?: string | null 
}) {
  try {
    const supabase = await createSupabaseServerComponentClient();
    if (!supabase) return { ok: false, message: "Erro de conexão." };

    const { data: { user } } = await supabase.auth.getUser();
    let error;

    if (data.id) {
      // Atualização de Changelog
      ({ error } = await supabase.from("changelog_entries").update({
        version: data.version,
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        released_at: data.released_at || new Date().toISOString()
      }).eq("id", data.id));
    } else {
      // Criação de Changelog
      ({ error } = await supabase.from("changelog_entries").insert({
        version: data.version,
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        released_at: data.released_at || new Date().toISOString(),
        created_by: user?.id
      }));
    }

    if (error) return { ok: false, message: error.message };
    
    revalidatePath("/dashboard/docs/changelog", "layout");
    revalidatePath("/docs/changelog", "layout");
    
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}

export async function deleteChangelogAction(id: string) {
  try {
    const supabase = await createSupabaseServerComponentClient();
    if (!supabase) return { ok: false, message: "Erro de conexão." };

    const { error } = await supabase
      .from("changelog_entries")
      .delete()
      .eq("id", id);
      
    if (error) return { ok: false, message: error.message };

    revalidatePath("/dashboard/docs/changelog", "layout");
    revalidatePath("/docs/changelog", "layout");
    
    return { ok: true };
  } catch (err: any) {
    return { ok: false, message: err.message };
  }
}