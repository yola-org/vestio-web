import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"
import PageSkeleton from "@/components/shared/PageSkeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <main className="main-container pt-6 pb-12">
        <SkeletonGroup className="space-y-7">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-5 w-3/5" />
        </SkeletonGroup>
      </main>
    </PageSkeleton>
  )
}
