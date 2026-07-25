import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-3 flex flex-col"
          >
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="w-12 h-3 rounded" />
            </div>
            <Skeleton className="w-20 h-3 rounded mb-1" />
            <Skeleton className="w-14 h-5 rounded" />
          </div>
        ))}
      </div>

      {/* Insights Card Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <div className="flex items-start gap-3">
          <Skeleton className="w-5 h-5 rounded shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-full h-3 rounded" />
            <Skeleton className="w-3/4 h-3 rounded" />
            <Skeleton className="w-5/6 h-3 rounded" />
          </div>
        </div>
      </div>

      {/* Sales Trends Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-28 h-4 rounded" />
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>
        <Skeleton className="w-full h-[200px] rounded-lg" />
      </div>

      {/* Top Items Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <Skeleton className="w-24 h-4 rounded mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-start gap-2 flex-1">
                <Skeleton className="w-5 h-4 rounded" />
                <div className="space-y-1">
                  <Skeleton className="w-24 h-3 rounded" />
                  <Skeleton className="w-16 h-2 rounded" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="w-8 h-3 rounded" />
                <Skeleton className="w-10 h-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Performance Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <Skeleton className="w-32 h-4 rounded mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="w-20 h-3 rounded" />
                <Skeleton className="w-10 h-3 rounded" />
              </div>
              <Skeleton className="w-full h-2 rounded-full" />
              <div className="flex items-center justify-between mt-1">
                <Skeleton className="w-8 h-2 rounded" />
                <Skeleton className="w-6 h-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Analytics Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <Skeleton className="w-32 h-4 rounded mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted rounded-xl p-3">
            <Skeleton className="w-20 h-2 rounded mb-1" />
            <Skeleton className="w-12 h-5 rounded" />
          </div>
          <div className="bg-muted rounded-xl p-3">
            <Skeleton className="w-24 h-2 rounded mb-1" />
            <Skeleton className="w-10 h-5 rounded" />
          </div>
        </div>
        <div className="bg-muted border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-24 h-2 rounded" />
          </div>
          <Skeleton className="w-28 h-3 rounded mb-1" />
          <div className="flex justify-between">
            <Skeleton className="w-16 h-2 rounded" />
            <Skeleton className="w-10 h-2 rounded" />
          </div>
        </div>
      </div>

      {/* Operations Performance Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <Skeleton className="w-32 h-4 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start justify-between">
              <div className="space-y-1">
                <Skeleton className="w-24 h-3 rounded" />
                <Skeleton className="w-36 h-2 rounded" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="w-16 h-3 rounded" />
                <Skeleton className="w-6 h-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Areas Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-28 h-4 rounded" />
          <Skeleton className="w-16 h-6 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-start gap-2 flex-1">
                <Skeleton className="w-4 h-4 rounded shrink-0" />
                <Skeleton className="w-28 h-3 rounded" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="w-8 h-3 rounded" />
                <Skeleton className="w-6 h-2 rounded" />
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

      {/* Business Score Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4 my-3">
        <Skeleton className="w-28 h-4 rounded mb-4" />
        <div className="flex items-center justify-center mb-4">
          <Skeleton className="w-24 h-24 rounded-full" />
        </div>
        <div className="mb-3 pb-3 border-b border-border">
          <Skeleton className="w-20 h-3 rounded mb-2" />
          <div className="space-y-1">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-2 rounded" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="w-28 h-3 rounded mb-2" />
          <div className="space-y-1">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-2 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
