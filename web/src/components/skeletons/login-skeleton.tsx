// web/src/components/skeletons/login-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function LoginSkeleton() {
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

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="hidden lg:block">
            <Skeleton className="h-3 w-52" />

            <div className="mt-5 space-y-4">
              <Skeleton className="h-20 w-full max-w-xl rounded-2xl" />
              <Skeleton className="h-20 w-full max-w-lg rounded-2xl" />
              <Skeleton className="h-20 w-full max-w-sm rounded-2xl" />
            </div>

            <div className="mt-7 max-w-lg space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-[88%]" />
              <Skeleton className="h-5 w-[72%]" />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-surface/88 p-5 shadow-irisMd backdrop-blur">
              <div className="flex items-start gap-4">
                <Skeleton className="size-11 shrink-0 rounded-full" />
                <div className="w-full">
                  <Skeleton className="h-8 w-48" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[92%]" />
                    <Skeleton className="h-4 w-[76%]" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="mx-auto w-full max-w-[28rem]">
            <div className="rounded-2xl border border-border bg-surface/92 p-6 shadow-irisLg backdrop-blur md:p-8">
              <div className="mb-8">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-10 w-72" />
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[82%]" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Skeleton className="mb-2 h-4 w-16" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                <div>
                  <Skeleton className="mb-2 h-4 w-14" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>

                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                </div>

                <Skeleton className="h-12 w-full rounded-full" />
                <Skeleton className="mx-auto h-4 w-56" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
