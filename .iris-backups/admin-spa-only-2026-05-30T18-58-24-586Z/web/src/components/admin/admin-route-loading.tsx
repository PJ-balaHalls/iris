// /web/src/components/admin/admin-route-loading.tsx
"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AdminDashboardSkeleton } from "@/components/admin/admin-dashboard-skeleton";

type AdminRouteLoadingProps = {
  collapsed: boolean;
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
    return url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/settings");
  } catch {
    return false;
  }
}

export function AdminRouteLoading({ collapsed }: AdminRouteLoadingProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
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

      setLoading(true);

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setLoading(false), 2500);
    }

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!loading) return;

    const id = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(id);
  }, [pathname, searchParams, loading]);

  if (!loading) return null;

  return (
    <div
      className={
        "pointer-events-none fixed inset-0 z-20 bg-[#FAF7F2]/72 pt-24 backdrop-blur-md transition-opacity duration-150 dark:bg-[#111111]/72 motion-reduce:transition-none " +
        (collapsed ? "lg:pl-[116px]" : "lg:pl-[336px]")
      }
      aria-hidden="true"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdminDashboardSkeleton />
      </div>
    </div>
  );
}
