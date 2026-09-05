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
      className={cn("animate-pulse rounded bg-color-7", className)}
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

function WhatsOnYourMindSkeleton() {
  return (
    <section id="img-carousel" className="pt-6" aria-hidden="true">
      <div className="flex gap-6 overflow-hidden pb-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-color-7 bg-card p-3"
          >
            <SkeletonBlock
              className="size-17 rounded-xl"
              delay={`${i * 100}ms`}
            />
            <SkeletonBlock className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularDishesSkeleton() {
  return (
    <>
      <div className="divider"></div>
      <section id="popular-dishes" aria-hidden="true">
        <SectionHeaderSkeleton subtitle />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="size-6 rounded-md" />
                <SkeletonBlock className="h-4 w-40" />
              </div>
              <DishRowSkeleton />
              <DishRowSkeleton />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function RestaurantsSkeleton() {
  return (
    <section id="restaurants" className="pt-8" aria-hidden="true">
      <SectionHeaderSkeleton />
      <div className="filter-btns flex flex-wrap gap-3 pt-1">
        {[...Array(6)].map((_, i) => (
          <SkeletonBlock
            key={i}
            className="h-10 w-24 rounded-full"
            delay={`${i * 100}ms`}
          />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-y-3 px-6 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function ReorderSkeleton() {
  return (
    <section className="pt-5" aria-hidden="true">
      <div className="flex flex-col gap-4 rounded-2xl border border-color-7 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <SkeletonBlock className="size-14 shrink-0 rounded-xl" />
          <div className="min-w-0 space-y-2">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="h-4 w-32" />
          </div>
        </div>
        <SkeletonBlock className="h-10 w-28 shrink-0 rounded-full" />
      </div>
    </section>
  );
}

export {
  SkeletonBlock,
  SectionHeaderSkeleton,
  DishRowSkeleton,
  RestaurantCardSkeleton,
  WhatsOnYourMindSkeleton,
  PopularDishesSkeleton,
  RestaurantsSkeleton,
  ReorderSkeleton,
};