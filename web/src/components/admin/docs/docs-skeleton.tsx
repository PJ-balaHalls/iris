import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function DocsManagementSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto w-full space-y-8 animate-pulse">
      {/* Skeleton do Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-border/50" />
          <Skeleton className="h-8 w-64 bg-border/50" />
          <Skeleton className="h-4 w-96 max-w-full bg-border/50" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full bg-border/50" />
      </div>

      {/* Skeleton dos Insights (Cards Superiores) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 border border-border rounded-2xl space-y-3 bg-surface/50">
            <Skeleton className="h-8 w-8 rounded-xl bg-border/50" />
            <Skeleton className="h-6 w-1/2 bg-border/50" />
            <Skeleton className="h-4 w-1/3 bg-border/50" />
          </div>
        ))}
      </div>

      {/* Skeleton da Tabela/Lista */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-48 bg-border/50" />
        <div className="border border-border rounded-2xl divide-y divide-border bg-surface/20">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex justify-between items-center bg-transparent">
              <div className="space-y-2 w-1/2">
                <Skeleton className="h-5 w-3/4 bg-border/50" />
                <Skeleton className="h-3 w-1/2 bg-border/50" />
              </div>
              <Skeleton className="h-6 w-20 rounded bg-border/50 hidden sm:block" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded bg-border/50" />
                <Skeleton className="h-8 w-20 rounded bg-border/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}