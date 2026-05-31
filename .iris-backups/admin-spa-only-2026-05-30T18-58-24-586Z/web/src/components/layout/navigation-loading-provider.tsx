// web/src/components/layout/navigation-loading-provider.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { GlobalLoading } from "@/components/system/global-loading";

const NAVIGATION_LOADING_DELAY_MS = 120;
const NAVIGATION_LOADING_TIMEOUT_MS = 8000;

function isInternalNavigableLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");

  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:")) return false;
  if (href.startsWith("tel:")) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.hasAttribute("data-no-global-loading")) return false;

  try {
    const url = new URL(anchor.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

export function NavigationLoadingProvider({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const delayTimerRef = useRef<number | null>(null);
  const watchdogTimerRef = useRef<number | null>(null);
  const [pendingPathname, setPendingPathname] = useState<string | null>(null);

  const clearTimers = useCallback(() => {
    if (delayTimerRef.current !== null) {
      window.clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    if (watchdogTimerRef.current !== null) {
      window.clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const clearPendingNavigation = useCallback(() => {
    clearTimers();
    setPendingPathname(null);
  }, [clearTimers]);

  const schedulePendingNavigation = useCallback(
    (targetPathname: string) => {
      clearTimers();

      delayTimerRef.current = window.setTimeout(() => {
        setPendingPathname(targetPathname);
      }, NAVIGATION_LOADING_DELAY_MS);

      watchdogTimerRef.current = window.setTimeout(() => {
        setPendingPathname(null);
      }, NAVIGATION_LOADING_TIMEOUT_MS);
    },
    [clearTimers]
  );

  useEffect(() => {
    clearPendingNavigation();
  }, [pathname, clearPendingNavigation]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigableLink(anchor)) return;

      const url = new URL(anchor.href);

      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      schedulePendingNavigation(url.pathname);
    }

    window.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", clearPendingNavigation);
    window.addEventListener("popstate", clearPendingNavigation);

    return () => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", clearPendingNavigation);
      window.removeEventListener("popstate", clearPendingNavigation);
      clearTimers();
    };
  }, [clearPendingNavigation, clearTimers, schedulePendingNavigation]);

  const loadingOverlay = useMemo(() => {
    if (!pendingPathname) return null;
    return <GlobalLoading routePath={pendingPathname} />;
  }, [pendingPathname]);

  return (
    <>
      {children}
      {loadingOverlay}
    </>
  );
}
