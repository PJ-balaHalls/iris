// /web/src/components/admin/admin-dashboard-skeleton.tsx
function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={"animate-pulse rounded-[28px] bg-white/70 shadow-sm ring-1 ring-[#E0DDD6]/80 dark:bg-white/[0.05] dark:ring-[#2A2A2A] motion-reduce:animate-none " + className} />;
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-[36px] border border-[#E0DDD6]/80 bg-white/45 p-6 backdrop-blur-2xl dark:border-[#2A2A2A] dark:bg-[#1C1C1C]/45 sm:p-8">
        <SkeletonBlock className="h-7 w-36 rounded-full" />
        <SkeletonBlock className="mt-5 h-10 w-full max-w-xl" />
        <SkeletonBlock className="mt-4 h-5 w-full max-w-2xl" />
        <SkeletonBlock className="mt-2 h-5 w-full max-w-lg" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-44" />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-40" />
        ))}
      </section>
    </div>
  );
}
