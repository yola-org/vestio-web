import FilterPanelSkeleton from "@/components/home/FilterPanelSkeleton"
import {
  ListingGridSkeleton,
  searchGridColumns,
} from "@/components/shared/ListingSkeletons"
import PageSkeleton from "@/components/shared/PageSkeleton"
import Skeleton from "@/components/shared/Skeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <main className="main-container pt-6 pb-12">
        <Skeleton className="mb-8 h-10 w-64 max-w-full" />
        <div className="flex flex-col gap-10 lg:flex-row">
          <FilterPanelSkeleton />
          <div className="min-w-0 flex-1">
            <ListingGridSkeleton columns={searchGridColumns} />
          </div>
        </div>
      </main>
    </PageSkeleton>
  )
}
