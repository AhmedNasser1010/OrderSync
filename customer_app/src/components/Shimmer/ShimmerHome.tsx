import { cn } from "@/lib/utils";

function SkeletonBlock({
  className,
  delay,
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-color-7",
        className
      )}
      style={delay ? { animationDelay: delay } : undefined}
    />
  );
}

function SectionHeaderSkeleton({ subtitle }: { subtitle?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4 pt-5 pb-5">
      <div className="min-w-0">
        <SkeletonBlock className="h-7 w-56 max-w-full" />
        {subtitle && <SkeletonBlock className="mt-2 h-4 w-40" />}
      </div>
      <div className="flex shrink-0 gap-2">
        <SkeletonBlock className="size-9 rounded-full" />
        <SkeletonBlock className="size-9 rounded-full" />
      </div>
    </div>
  );
}

function DishRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-color-7 bg-card p-3">
      <SkeletonBlock className="size-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
      <SkeletonBlock className="h-6 w-14 shrink-0 rounded-full" />
    </div>
  );
}

function RestaurantCardSkeleton({ cardWidth }: { cardWidth?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", cardWidth)}>
      <SkeletonBlock className="h-56 w-full rounded-xl" />
      <div className="mx-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-5 w-14 rounded" />
        </div>
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-3.5 w-24" />
      </div>
    </div>
  );
}

function ShimmerHome() {
  return (
    <div className="container mx-auto mb-10 overflow-x-clip px-2 sm:px-10">
      <div className="flex items-center gap-3 pt-4 w-full">
        <SkeletonBlock className="h-11 w-48 shrink-0 rounded-full" />
        <SkeletonBlock className="h-11 flex-1 rounded-full" />
      </div>

      <SkeletonBlock className="mt-6 h-55 w-full rounded-3xl sm:h-52" />

      <div className="divider"></div>
      <section>
        <SectionHeaderSkeleton />
        <div className="flex gap-6 overflow-hidden pb-2">
          {[...Array(5)].map((_, i) => (
            <SkeletonBlock
              key={i}
              className="size-36 shrink-0 rounded-full"
              delay={`${i * 100}ms`}
            />
          ))}
        </div>
      </section>

      <div className="divider"></div>
      <section>
        <SectionHeaderSkeleton />
        <div className="flex gap-6 overflow-hidden pb-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-80 shrink-0">
              <RestaurantCardSkeleton />
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>
      <section>
        <SectionHeaderSkeleton subtitle />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <SkeletonBlock className="h-6 w-40" />
              <DishRowSkeleton />
              <DishRowSkeleton />
            </div>
          ))}
        </div>
      </section>

      <div className="divider"></div>
      <section>
        <SkeletonBlock className="h-8 w-72 max-w-full 2xl:mx-0 mx-auto" />
        <div className="filter-btns flex gap-3 2xl:justify-start justify-center md:flex-nowrap flex-wrap pt-5">
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock
              key={i}
              className="h-10 w-24 rounded-full"
              delay={`${i * 100}ms`}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-8 px-6 mt-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <div className="divider"></div>
      <SkeletonBlock className="h-56 w-full rounded-3xl sm:h-64" />
    </div>
  );
}

export default ShimmerHome;
