// web/src/components/skeletons/hero-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-[var(--layout-page-max)] flex-col px-6 py-8 md:px-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        </div>

        <Skeleton className="h-9 w-24 rounded-full" />
      </header>

      <div className="grid flex-1 items-center gap-12 py-16 md:grid-cols-[1.06fr_0.94fr] md:py-24">
        <div className="max-w-3xl">
          <Skeleton className="mb-7 h-10 w-72 rounded-full" />

          <div className="space-y-4">
            <Skeleton className="h-16 w-full max-w-[42rem] rounded-2xl md:h-20" />
            <Skeleton className="h-16 w-full max-w-[36rem] rounded-2xl md:h-20" />
            <Skeleton className="h-16 w-full max-w-[24rem] rounded-2xl md:h-20" />
          </div>

          <div className="mt-7 max-w-2xl space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[92%]" />
            <Skeleton className="h-5 w-[74%]" />
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 w-52 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur md:p-6">
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="w-full">
                <Skeleton className="h-8 w-48" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border bg-background p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="w-full">
                <Skeleton className="h-8 w-44" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[86%]" />
                  <Skeleton className="h-4 w-[68%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <Skeleton className="h-3 w-28" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[84%]" />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
