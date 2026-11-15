import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"

export default function FilterPanelSkeleton() {
  return (
    <aside className="w-full shrink-0 lg:w-64">
      <SkeletonGroup className="space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-14 rounded-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </SkeletonGroup>
    </aside>
  )
}
