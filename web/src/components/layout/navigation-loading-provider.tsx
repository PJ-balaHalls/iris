// /web/src/components/layout/navigation-loading-provider.tsx
"use client";

import type { ReactNode } from "react";

type NavigationLoadingProviderProps = {
  children: ReactNode;
};

export function NavigationLoadingProvider({ children }: NavigationLoadingProviderProps) {
  return <>{children}</>;
}

export default NavigationLoadingProvider;
