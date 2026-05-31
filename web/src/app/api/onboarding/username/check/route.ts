// web/src/app/api/onboarding/username/check/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerAdminClient } from "@/lib/supabase/server-admin";

function normalizeUsername(value: string | null): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = normalizeUsername(url.searchParams.get("username"));

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return NextResponse.json({
      available: false,
      checked: false,
      reason: "Formato inválido.",
    });
  }

  const supabase = createSupabaseServerAdminClient();

  if (!supabase) {
    return NextResponse.json({
      available: false,
      checked: false,
      reason: "Cliente server-side do Supabase não configurado.",
    });
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({
      available: false,
      checked: false,
      reason: "Não foi possível verificar agora.",
    });
  }

  return NextResponse.json({
    available: !data,
    checked: true,
    reason: data ? "Usuário indisponível." : "Usuário disponível.",
  });
}
