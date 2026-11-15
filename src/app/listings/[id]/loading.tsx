import PageSkeleton from "@/components/shared/PageSkeleton"
import Skeleton from "@/components/shared/Skeleton"
import { ListingDetailSkeleton } from "@/components/shared/ListingSkeletons"

export default function Loading() {
  return (
    <PageSkeleton>
      <main className="main-container py-7 sm:py-10">
        <Skeleton className="mb-6 h-5 w-32 sm:mb-8" />
        <ListingDetailSkeleton />
      </main>
    </PageSkeleton>
  )
}
