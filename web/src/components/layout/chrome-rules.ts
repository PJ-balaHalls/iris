// web/src/components/layout/chrome-rules.ts
type RouteRule = {
  readonly exact?: readonly string[];
  readonly prefixes?: readonly string[];
};

const heroTopbarRule: RouteRule = {
  exact: ["/"]
};

const publicFooterRule: RouteRule = {
  exact: ["/", "/kids"],
  prefixes: ["/kids/"]
};

const hiddenSystemStatusRule: RouteRule = {
  exact: ["/", "/login"],
  prefixes: ["/login/"]
};

export const chromeVisibilityDescription = {
  heroTopbar:
    "Exibir somente na home pública (/), como navbar de cápsula translúcida da seção hero.",
  publicFooter:
    "Exibir somente em páginas públicas informativas: / e /kids. Não exibir em fluxos de autenticação, onboarding ou painel privado.",
  systemStatusBar:
    "Ocultar em / e /login. Nas demais rotas, respeitar NEXT_PUBLIC_IRIS_SHOW_STATUS_BAR."
} as const;

function normalizePathname(pathname: string | null | undefined) {
  if (!pathname) return "/";

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function matchesRouteRule(pathname: string | null | undefined, rule: RouteRule) {
  const normalizedPathname = normalizePathname(pathname);

  if (rule.exact?.includes(normalizedPathname)) {
    return true;
  }

  return Boolean(
    rule.prefixes?.some((prefix) => normalizedPathname.startsWith(prefix))
  );
}

export function shouldShowHeroTopbar(pathname: string | null | undefined) {
  return matchesRouteRule(pathname, heroTopbarRule);
}

export function shouldShowPublicFooter(pathname: string | null | undefined) {
  return matchesRouteRule(pathname, publicFooterRule);
}

export function shouldShowSystemStatusBar(pathname: string | null | undefined) {
  return !matchesRouteRule(pathname, hiddenSystemStatusRule);
}
