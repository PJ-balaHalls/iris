// web/src/lib/auth/redirects.ts
import { z } from "zod";

const DEFAULT_ADMIN_REDIRECT = "/dashboard";

const allowedPostLoginPrefixes = ["/dashboard", "/settings", "/admin"] as const;

const blockedAuthFlowPrefixes = [
  "/login",
  "/register",
  "/logout",
  "/forgot-password",
  "/reset-password"
] as const;

const redirectCandidateSchema = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .refine((value) => value.startsWith("/") && !value.startsWith("//"), {
    message: "O redirecionamento precisa ser um caminho interno."
  })
  .refine((value) => !value.includes("\\"), {
    message: "O redirecionamento não pode conter barras invertidas."
  });

function startsWithAnyPrefix(value: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => value === prefix || value.startsWith(`${prefix}/`));
}

export function resolveSafePostLoginRedirect(candidate: string | null | undefined): string {
  const parsed = redirectCandidateSchema.safeParse(candidate ?? "");

  if (!parsed.success) {
    return DEFAULT_ADMIN_REDIRECT;
  }

  try {
    const url = new URL(parsed.data, "https://iris.local");
    const resolvedPath = `${url.pathname}${url.search}${url.hash}`;

    if (url.origin !== "https://iris.local") {
      return DEFAULT_ADMIN_REDIRECT;
    }

    if (startsWithAnyPrefix(url.pathname, blockedAuthFlowPrefixes)) {
      return DEFAULT_ADMIN_REDIRECT;
    }

    if (!startsWithAnyPrefix(url.pathname, allowedPostLoginPrefixes)) {
      return DEFAULT_ADMIN_REDIRECT;
    }

    return resolvedPath;
  } catch {
    return DEFAULT_ADMIN_REDIRECT;
  }
}

export function createLoginPathWithRedirect(pathname: string, search = "") {
  const target = `${pathname}${search}`;
  const safeTarget = resolveSafePostLoginRedirect(target);

  return `/login?redirectTo=${encodeURIComponent(safeTarget)}`;
}
