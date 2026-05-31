// web/src/app/api/system/status/route.ts
import { NextResponse } from "next/server";
import {
  getSupabasePublishableKey,
  getSupabaseServerSecretKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

type HealthSeverity = "success" | "warning" | "error";

type HealthItem = {
  key: string;
  label: string;
  ok: boolean;
  severity: HealthSeverity;
  detail: string;
};

function getEnvStatusItems(): {
  supabaseUrl: string | null;
  publishableKey: string | null;
  serverSecretKey: string | null;
  items: HealthItem[];
} {
  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  const serverSecretKey = getSupabaseServerSecretKey();

  return {
    supabaseUrl,
    publishableKey,
    serverSecretKey,
    items: [
      {
        key: "supabase_url",
        label: "Supabase URL",
        ok: Boolean(supabaseUrl),
        severity: supabaseUrl ? "success" : "error",
        detail: supabaseUrl
          ? "Variável carregada e formato válido. Valor oculto por segurança."
          : "NEXT_PUBLIC_SUPABASE_URL ausente ou inválida.",
      },
      {
        key: "publishable_key",
        label: "Publishable Key",
        ok: Boolean(publishableKey),
        severity: publishableKey ? "success" : "error",
        detail: publishableKey
          ? "Chave pública carregada. Valor oculto por segurança."
          : "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ausente.",
      },
      {
        key: "server_secret_key",
        label: "Server Secret",
        ok: Boolean(serverSecretKey),
        severity: serverSecretKey ? "success" : "warning",
        detail: serverSecretKey
          ? "Chave server-side presente. Valor oculto e não enviado ao navegador."
          : "Chave server-side ausente. Use SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY apenas no servidor.",
      },
    ],
  };
}

async function checkSupabaseAuthHealth(supabaseUrl: string): Promise<HealthItem> {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      method: "GET",
      cache: "no-store",
    });

    return {
      key: "supabase_auth_health",
      label: "Supabase Auth",
      ok: response.ok,
      severity: response.ok ? "success" : "error",
      detail: response.ok
        ? "Projeto Supabase alcançável."
        : `Auth Health respondeu com status ${response.status}.`,
    };
  } catch {
    return {
      key: "supabase_auth_health",
      label: "Supabase Auth",
      ok: false,
      severity: "error",
      detail: "Não foi possível alcançar o projeto Supabase.",
    };
  }
}

async function checkSupabaseDataApi(
  supabaseUrl: string,
  publishableKey: string,
): Promise<HealthItem> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: publishableKey,
      },
      cache: "no-store",
    });

    return {
      key: "supabase_data_api",
      label: "Data API",
      ok: response.ok,
      severity: response.ok ? "success" : "error",
      detail: response.ok
        ? "Data API respondeu. Código e Supabase estão comunicando."
        : `Data API respondeu com status ${response.status}. Verifique a publishable key no painel do Supabase.`,
    };
  } catch {
    return {
      key: "supabase_data_api",
      label: "Data API",
      ok: false,
      severity: "error",
      detail: "Não foi possível alcançar a Data API do Supabase.",
    };
  }
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const { supabaseUrl, publishableKey, items } = getEnvStatusItems();

  if (supabaseUrl) {
    items.push(await checkSupabaseAuthHealth(supabaseUrl));
  } else {
    items.push({
      key: "supabase_auth_health",
      label: "Supabase Auth",
      ok: false,
      severity: "error",
      detail: "Teste não executado porque a URL não foi carregada.",
    });
  }

  if (supabaseUrl && publishableKey) {
    items.push(await checkSupabaseDataApi(supabaseUrl, publishableKey));
  } else {
    items.push({
      key: "supabase_data_api",
      label: "Data API",
      ok: false,
      severity: "error",
      detail: "Teste não executado porque URL ou publishable key não foram carregadas.",
    });
  }

  return NextResponse.json(
    {
      ok: items.every((item) => item.severity !== "error"),
      checkedAt,
      environment: process.env.NODE_ENV,
      items,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    },
  );
}
