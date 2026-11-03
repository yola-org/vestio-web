'use client';

export function ListingCardSkeleton() {
  return (
    <div className="group animate-pulse">
      <div className="relative aspect-[4/5] overflow-hidden bg-black/5 rounded-2xl"></div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="h-4 w-3/4 bg-black/5 rounded mb-2"></div>
            <div className="h-3 w-1/4 bg-black/5 rounded"></div>
          </div>
          <div className="h-4 w-16 bg-black/5 rounded"></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3">
          <div className="h-3 w-20 bg-black/5 rounded"></div>
          <div className="h-3 w-16 bg-black/5 rounded"></div>
        </div>
      </div>
    </div>
  );
}

interface ListingGridSkeletonProps {
  count?: number;
  columns?: string;
}

export function ListingGridSkeleton({ count = 8, columns = 'grid-cols-2 lg:grid-cols-4' }: ListingGridSkeletonProps) {
  return (
    <div className={`grid ${columns} gap-x-4 gap-y-9 lg:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
