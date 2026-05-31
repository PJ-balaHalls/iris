// web/src/app/logout/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerComponentClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  const url = new URL("/login", request.url);
  url.searchParams.set("reason", "signed_out");

  return NextResponse.redirect(url);
}
