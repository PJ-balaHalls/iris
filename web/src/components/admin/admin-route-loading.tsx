// /web/src/components/admin/admin-route-loading.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

type AdminSpaNavigationControllerProps = {
  onNavigatingChange: (isNavigating: boolean) => void;
};

function isModifiedEvent(event: MouseEvent): boolean {
  return Boolean(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);
}

function shouldTriggerForAnchor(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");

  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    return (
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/settings")
    );
  } catch {
    return false;
  }
}

export function AdminSpaNavigationController({ onNavigatingChange }: AdminSpaNavigationControllerProps) {
  const pathname = usePathname();
  const timeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedEvent(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldTriggerForAnchor(anchor)) return;

      const url = new URL(anchor.href);
      const current = window.location.pathname + window.location.search;
      const next = url.pathname + url.search;

      if (current === next) return;

      onNavigatingChange(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        onNavigatingChange(false);
      }, 5000);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [onNavigatingChange]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      onNavigatingChange(false);
    }, 160);

    return () => window.clearTimeout(id);
  }, [pathname, onNavigatingChange]);

  return null;
}
