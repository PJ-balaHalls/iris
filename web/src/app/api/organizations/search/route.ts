// web/src/app/api/organizations/search/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerAdminClient } from "@/lib/supabase/server-admin";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const digits = onlyDigits(query);

  if (query.length < 2) {
    return NextResponse.json(
      { ok: false, message: "Digite pelo menos 2 caracteres." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase server-side não configurado." },
      { status: 500 },
    );
  }

  let requestBuilder = supabase
    .from("admin_organizations")
    .select("id, legal_name, cnpj, segment, verification_status")
    .limit(8);

  if (digits.length >= 8) {
    requestBuilder = requestBuilder.or(
      "legal_name.ilike.%" + query + "%,cnpj.eq." + digits,
    );
  } else {
    requestBuilder = requestBuilder.ilike("legal_name", "%" + query + "%");
  }

  const { data, error } = await requestBuilder;

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Não foi possível buscar organizações." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    organizations: (data ?? []).map((organization) => ({
      id: organization.id,
      legalName: organization.legal_name,
      cnpj: organization.cnpj,
      segment: organization.segment,
      verificationStatus: organization.verification_status,
    })),
  });
}
