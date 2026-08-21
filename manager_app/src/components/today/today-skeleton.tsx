import { Skeleton } from "@/components/ui/skeleton";

export function TodaySkeleton() {
  return (
    <div className="space-y-2">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-3 flex flex-col"
          >
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="w-5 h-5 rounded" />
            </div>
            <Skeleton className="w-20 h-3 rounded mb-1" />
            <Skeleton className="w-14 h-5 rounded" />
          </div>
        ))}
      </div>

      {/* Active Orders Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-1">
              <Skeleton className="w-24 h-2 rounded" />
              <Skeleton className="w-10 h-6 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="w-8 h-2 rounded" />
          </div>
        </div>
      </div>

      {/* Status Breakdown Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <Skeleton className="w-32 h-4 rounded mb-4" />
        <Skeleton className="w-full h-[200px] rounded-lg" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-16 h-2 rounded" />
              </div>
              <div className="text-right space-y-0.5">
                <Skeleton className="w-8 h-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <Skeleton className="w-32 h-4 rounded mb-4" />
        <Skeleton className="w-full h-[200px] rounded-lg" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="w-16 h-2 rounded" />
              </div>
              <div className="text-right space-y-0.5">
                <Skeleton className="w-8 h-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Items Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="w-5 h-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="w-24 h-3 rounded" />
                  <Skeleton className="w-16 h-2 rounded" />
                </div>
              </div>
              <Skeleton className="w-8 h-3 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Customer Insights Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1">
            <Skeleton className="w-10 h-5 rounded mx-auto" />
            <Skeleton className="w-16 h-2 rounded mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="w-10 h-5 rounded mx-auto" />
            <Skeleton className="w-20 h-2 rounded mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="w-10 h-5 rounded mx-auto" />
            <Skeleton className="w-8 h-2 rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
