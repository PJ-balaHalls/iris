// web/middleware.ts
import { type NextRequest, NextResponse } from "next/server";
import {
  copyMiddlewareCookies,
  refreshSupabaseMiddlewareSession
} from "@/lib/supabase/middleware";
import {
  createLoginPathWithRedirect,
  resolveSafePostLoginRedirect
} from "@/lib/auth/redirects";

const protectedPagePrefixes = ["/dashboard", "/settings", "/admin"] as const;
const protectedApiPrefixes = ["/api/admin"] as const;
const authPagePrefixes = ["/login"] as const;

function startsWithAnyPrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function createJsonUnauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      message: "Sessão administrativa ausente ou expirada."
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedPage = startsWithAnyPrefix(pathname, protectedPagePrefixes);
  const isProtectedApi = startsWithAnyPrefix(pathname, protectedApiPrefixes);
  const isAuthPage = startsWithAnyPrefix(pathname, authPagePrefixes);

  if (!isProtectedPage && !isProtectedApi && !isAuthPage) {
    return NextResponse.next();
  }

  const session = await refreshSupabaseMiddlewareSession(request);

  if (isProtectedApi && !session.userId) {
    return copyMiddlewareCookies(session.response, createJsonUnauthorizedResponse());
  }

  if (isProtectedPage && !session.userId) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?redirectTo=${encodeURIComponent(
      resolveSafePostLoginRedirect(`${pathname}${request.nextUrl.search}`)
    )}`;

    return copyMiddlewareCookies(session.response, NextResponse.redirect(loginUrl));
  }

  if (isAuthPage && session.userId) {
    const redirectTo = resolveSafePostLoginRedirect(
      request.nextUrl.searchParams.get("redirectTo")
    );

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectTo.split("?")[0] || "/dashboard";
    redirectUrl.search = redirectTo.includes("?")
      ? `?${redirectTo.split("?").slice(1).join("?")}`
      : "";

    return copyMiddlewareCookies(session.response, NextResponse.redirect(redirectUrl));
  }

  if (session.missingConfig && (isProtectedPage || isProtectedApi)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?redirectTo=${encodeURIComponent(
      createLoginPathWithRedirect(pathname, request.nextUrl.search)
    )}`;

    return copyMiddlewareCookies(session.response, NextResponse.redirect(loginUrl));
  }

  return session.response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/login"
  ]
};
