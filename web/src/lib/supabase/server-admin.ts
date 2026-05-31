// web/src/lib/supabase/server-admin.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseServerSecretKey,
  getSupabaseServerUrl,
} from "@/lib/supabase/server-env";

export function createSupabaseServerAdminClient(): SupabaseClient | null {
  const supabaseUrl = getSupabaseServerUrl();
  const secretKey = getSupabaseServerSecretKey();

  if (!supabaseUrl || !secretKey) {
    return null;
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
