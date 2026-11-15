import OffersSkeleton from "@/components/offers/OffersSkeleton"
import PageSkeleton from "@/components/shared/PageSkeleton"
import Skeleton from "@/components/shared/Skeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <main className="main-container py-10 sm:py-12">
        <Skeleton className="mb-6 h-12 w-36" />
        <div className="mb-6 flex gap-4 border-b border-black/10 pb-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-28" />
        </div>
        <OffersSkeleton />
      </main>
    </PageSkeleton>
  )
}
