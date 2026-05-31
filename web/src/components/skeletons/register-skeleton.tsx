// web/src/components/skeletons/register-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function RegisterSkeleton() {
  return (
    <main className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[var(--layout-page-max)] flex-col">
        <header className="flex items-center justify-between">
          <Skeleton className="h-10 w-24 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="h-5 w-12" />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="hidden lg:block">
            <Skeleton className="h-3 w-56" />
            <div className="mt-5 space-y-4">
              <Skeleton className="h-20 w-full max-w-lg rounded-2xl" />
              <Skeleton className="h-20 w-full max-w-md rounded-2xl" />
              <Skeleton className="h-20 w-full max-w-sm rounded-2xl" />
            </div>
            <div className="mt-8 rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd">
              <Skeleton className="h-8 w-52" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[86%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            </div>
          </aside>

          <div className="w-full">
            <div className="rounded-2xl border border-border bg-surface/92 p-6 shadow-irisLg md:p-8">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="mt-4 h-10 w-72" />
              <Skeleton className="mt-4 h-4 w-full max-w-xl" />
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
              <div className="mt-8 flex justify-between">
                <Skeleton className="h-11 w-28 rounded-full" />
                <Skeleton className="h-11 w-40 rounded-full" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
