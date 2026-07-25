import { Skeleton } from "@/components/ui/skeleton";

export function MenuSkeleton() {
  return (
    <div className="space-y-4">
      {/* Action Buttons Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-10 rounded-lg" />
        <Skeleton className="flex-1 h-10 rounded-lg" />
      </div>

      {/* Order Discounts Section Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-24 h-6 rounded-lg" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="w-16 h-5 rounded-full shrink-0" />
                <div className="min-w-0 space-y-1">
                  <Skeleton className="w-28 h-3 rounded" />
                  <Skeleton className="w-20 h-2 rounded" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="w-28 h-3 rounded" />
                  <Skeleton className="w-20 h-2 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="w-6 h-6 rounded" />
              </div>
            </div>

            {/* Menu Items */}
            <div className="ps-2 sm:ps-4 space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div
                  key={j}
                  className="flex items-center justify-between p-3 bg-card/50 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="w-24 h-3 rounded" />
                      <Skeleton className="w-16 h-2 rounded" />
                      <Skeleton className="w-12 h-2 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded" />
                    <Skeleton className="w-6 h-6 rounded" />
                  </div>
                </div>
              ))}
              {/* Add Item Button */}
              <Skeleton className="w-full h-12 rounded-lg border-2 border-dashed" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
