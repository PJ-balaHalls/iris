// web/src/lib/supabase/server-env.ts
import { getSupabasePublicKey, getSupabasePublicUrl } from "@/lib/supabase/public-env";

export function getSupabaseServerUrl(): string | null {
  return getSupabasePublicUrl();
}

export function getSupabaseServerSecretKey(): string | null {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    null
  );
}

export function getSupabaseServerFallbackKey(): string | null {
  return getSupabaseServerSecretKey() || getSupabasePublicKey();
}
