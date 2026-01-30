export function StaffCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      {/* Header with avatar and status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
          <div className="space-y-2">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse transition-opacity duration-200" />
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 w-10 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
          <div className="h-3 w-36 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-10 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
          <div className="h-5 w-9 rounded-full bg-gray-200 animate-pulse transition-opacity duration-200" />
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse transition-opacity duration-200" />
      </div>
    </div>
  );
}
