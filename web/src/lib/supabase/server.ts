// web/src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicKey, getSupabasePublicUrl } from "@/lib/supabase/public-env";

export async function createSupabaseServerComponentClient(): Promise<SupabaseClient | null> {
  const supabaseUrl = getSupabasePublicUrl();
  const supabasePublishableKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components podem não permitir escrita de cookies.
          // O middleware mantém a sessão atualizada antes da renderização protegida.
        }
      }
    }
  });
}
