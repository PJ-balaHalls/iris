// web/src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublicKey,
  getSupabasePublicUrl
} from "@/lib/supabase/public-env";

type CreateSupabaseBrowserClientOptions = {
  persistSession?: boolean;
};

export function createSupabaseBrowserClient(
  _options: CreateSupabaseBrowserClientOptions = {}
): SupabaseClient | null {
  const supabaseUrl = getSupabasePublicUrl();
  const supabasePublishableKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce"
    }
  });
}
