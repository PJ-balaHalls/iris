// web/src/components/layout/app-chrome.tsx
"use client";

import { usePathname } from "next/navigation";
import { HeroTopbar } from "@/components/layout/hero-topbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  shouldShowHeroTopbar,
  shouldShowPublicFooter,
  shouldShowSystemStatusBar
} from "@/components/layout/chrome-rules";
import { SystemStatusBar } from "@/components/system/system-status-bar";

type AppChromeProps = Readonly<{
  children: React.ReactNode;
}>;

const isStatusBarEnabledByEnv =
  process.env.NEXT_PUBLIC_IRIS_SHOW_STATUS_BAR !== "false";

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();

  const canRenderSystemStatusBar =
    isStatusBarEnabledByEnv && shouldShowSystemStatusBar(pathname);

  const canRenderHeroTopbar = shouldShowHeroTopbar(pathname);
  const canRenderPublicFooter = shouldShowPublicFooter(pathname);

  return (
    <>
      {canRenderSystemStatusBar ? <SystemStatusBar /> : null}
      {canRenderHeroTopbar ? <HeroTopbar /> : null}

      {children}

      {canRenderPublicFooter ? <PublicFooter /> : null}
    </>
  );
}
