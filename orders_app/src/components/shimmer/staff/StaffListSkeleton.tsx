import { HeaderSkeleton } from "./HeaderSkeleton";
import { StaffCardSkeleton } from "./StaffCardSkeleton";

export function StaffListSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header Skeleton */}
      <HeaderSkeleton />

      {/* Staff List Skeleton */}
      <main className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-3">
          <StaffCardSkeleton />
          <StaffCardSkeleton />
          <StaffCardSkeleton />
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-4">
        <div className="h-11 w-full rounded-md bg-gray-200 animate-pulse transition-opacity duration-200" />
      </footer>
    </div>
  );
}
