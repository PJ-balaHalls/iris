"use server";

import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ContentEntry } from "./types";

export async function saveContentEntryAction(data: Partial<ContentEntry>) {
  try {
    const supabase = await createSupabaseServerComponentClient();
    if (!supabase) return { ok: false, message: "Erro de conexão com o banco de dados." };

    const { data: { user } } = await supabase.auth.getUser();

    // Preparando o payload para o PostgreSQL
    const payload = {
      type: data.type,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      status: data.status || "draft",
      cover_config: data.cover_config || { type: "none" },
      icon_config: data.icon_config || { name: "FileText" },
      blocks: data.blocks || [],
      metadata: data.metadata || {},
      author_id: user?.id,
      published_at: data.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    let result;

    if (data.id) {
      result = await supabase
        .from("content_entries")
        .update(payload)
        .eq("id", data.id)
        .select();
    } else {
      result = await supabase
        .from("content_entries")
        .insert(payload)
        .select();
    }

    if (result.error) {
      return { ok: false, message: result.error.message };
    }

    // Auditoria oficial
    await supabase.from("botanic_identity_audit_logs").insert({
      actor_user_id: user?.id,
      target_user_id: user?.id,
      action: data.id ? `content.${data.type}.update` : `content.${data.type}.create`,
      reason: `Conteúdo "${data.title}" salvo via Content Studio.`
    });

    revalidatePath("/dashboard/content");
    revalidatePath("/docs");
    
    return { ok: true, data: result.data[0] };
  } catch (err: any) {
    return { ok: false, message: err.message || "Erro interno." };
  }
}