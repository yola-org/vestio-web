import PageSkeleton from "@/components/shared/PageSkeleton"
import Skeleton from "@/components/shared/Skeleton"
import { ListingDetailSkeleton } from "@/components/shared/ListingSkeletons"

export default function Loading() {
  return (
    <PageSkeleton>
      <main className="main-container pt-6 pb-7 sm:pb-10">
        <Skeleton className="mb-6 h-5 w-32 sm:mb-8" />
        <ListingDetailSkeleton />
      </main>
    </PageSkeleton>
  )
}
