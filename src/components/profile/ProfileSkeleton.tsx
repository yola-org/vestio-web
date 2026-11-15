import { ListingGridSkeleton } from "@/components/shared/ListingSkeletons"
import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"

export const profileListingColumns =
  "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"

export function ProfileContentSkeleton() {
  return (
    <>
      <SkeletonGroup>
        <div className="mb-10 rounded-[2rem] border border-black/5 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <Skeleton className="size-32 shrink-0 rounded-full" />
            <div className="w-full flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-9 w-36 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
              </div>
              <div className="max-w-2xl space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex flex-wrap gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-x-4 border-b border-black/10 pb-4 sm:gap-x-8">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-5 w-20" />
          ))}
        </div>
      </SkeletonGroup>
      <ListingGridSkeleton count={5} columns={profileListingColumns} />
    </>
  )
}
