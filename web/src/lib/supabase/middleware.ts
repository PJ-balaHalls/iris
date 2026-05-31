// web/src/lib/supabase/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicKey, getSupabasePublicUrl } from "@/lib/supabase/public-env";

export type MiddlewareSessionResult = {
  userId: string | null;
  response: NextResponse;
  missingConfig: boolean;
};

export async function refreshSupabaseMiddlewareSession(
  request: NextRequest
): Promise<MiddlewareSessionResult> {
  const supabaseUrl = getSupabasePublicUrl();
  const supabasePublishableKey = getSupabasePublicKey();

  let response = NextResponse.next({
    request
  });

  if (!supabaseUrl || !supabasePublishableKey) {
    return {
      userId: null,
      response,
      missingConfig: true
    };
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return {
    userId: user?.id ?? null,
    response,
    missingConfig: false
  };
}

export function copyMiddlewareCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}
