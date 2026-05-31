// web/src/lib/supabase/public-env.ts
export function getSupabasePublicUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) return null;

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return value.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function getSupabasePublicKey(): string | null {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    null
  );
}
