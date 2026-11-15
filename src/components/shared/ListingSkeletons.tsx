import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"

export const searchGridColumns = "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

export function ListingCardSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-[4/5]" />
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-4 flex justify-between gap-3 border-t border-black/10 pt-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}

export function ListingGridSkeleton({
  count = 8,
  columns = "grid-cols-2 lg:grid-cols-4",
}: {
  count?: number
  columns?: string
}) {
  return (
    <SkeletonGroup className={`grid ${columns} gap-x-4 gap-y-9 lg:gap-6`}>
      {Array.from({ length: count }, (_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </SkeletonGroup>
  )
}

export function ListingDetailSkeleton() {
  return (
    <SkeletonGroup className="grid items-stretch md:grid-cols-[1.2fr_1fr]">
      <Skeleton className="aspect-[4/5] rounded-none md:aspect-auto" />
      <div
        aria-hidden="true"
        className="min-w-0 space-y-5 border border-black/10 bg-white p-5 sm:p-6 lg:p-8"
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="space-y-3 border-t border-black/10 pt-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-4 border-t border-black/10 pt-4">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="grid grid-cols-2 gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonGroup>
  )
}
