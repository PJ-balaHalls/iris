// mobile/src/utils/routes.ts
import type { Href } from "expo-router";

export function normalizePrivateSuccessRoute(route: string | null | undefined): Href {
  if (!route || route === "/(tabs)" || route === "(tabs)") {
    return "/home" as Href;
  }

  return route as Href;
}
