import { Skeleton } from "@/components/ui/skeleton";

export function DiscountAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-3 text-center"
          >
            <Skeleton className="w-16 h-6 rounded mx-auto mb-1" />
            <Skeleton className="w-20 h-2 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Bar Chart Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4">
        <Skeleton className="w-48 h-4 rounded mb-4" />
        <Skeleton className="w-full h-[250px] rounded-lg" />
      </div>

      {/* Data Table Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-4 mx-4">
        <Skeleton className="w-40 h-4 rounded mb-3" />
        <div className="space-y-2">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b border-border pb-2">
            <Skeleton className="w-20 h-3 rounded" />
            <div className="flex gap-8">
              <Skeleton className="w-16 h-3 rounded" />
              <Skeleton className="w-20 h-3 rounded" />
              <Skeleton className="w-16 h-3 rounded" />
              <Skeleton className="w-14 h-3 rounded" />
              <Skeleton className="w-10 h-3 rounded" />
            </div>
          </div>
          {/* Table Rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border/50"
            >
              <Skeleton className="w-16 h-3 rounded" />
              <div className="flex gap-8">
                <Skeleton className="w-12 h-3 rounded" />
                <Skeleton className="w-14 h-3 rounded" />
                <Skeleton className="w-10 h-3 rounded" />
                <Skeleton className="w-12 h-3 rounded" />
                <Skeleton className="w-8 h-3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
