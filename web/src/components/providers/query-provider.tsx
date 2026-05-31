// web/src/components/providers/query-provider.tsx
"use client";

import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

const ONE_MINUTE = 60 * 1000;

const queryDefaultOptions: DefaultOptions = {
  queries: {
    staleTime: 2 * ONE_MINUTE,
    gcTime: 10 * ONE_MINUTE,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry(failureCount, error) {
      if (failureCount >= 2) return false;

      if (
        error instanceof Error &&
        /(401|403|unauthorized|forbidden)/i.test(error.message)
      ) {
        return false;
      }

      return true;
    },
    structuralSharing: true
  },
  mutations: {
    retry: false
  }
};

export function QueryProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: queryDefaultOptions
    });
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
