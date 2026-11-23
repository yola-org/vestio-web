import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"

export function MegaMenuSkeleton() {
  return (
    <div className="absolute top-full right-0 left-0 border-t border-black/10 bg-[#f7f3ea] shadow-[0_22px_50px_rgba(0,0,0,0.16)]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-6 gap-8 py-10 content-padding">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={i < 5 ? "border-r border-black/10 pr-4" : ""}>
            <Skeleton className="mb-4 h-6 w-24" />
            <div className="space-y-2.5">
              {[...Array(5)].map((_, j) => (
                <Skeleton key={j} className="h-4 w-full max-w-[120px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HeaderNavSkeleton() {
  return (
    <div className="flex h-12 min-w-0 flex-1 items-center gap-8 overflow-x-hidden">
      <Skeleton className="h-4 w-32" />
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-20" />
      ))}
    </div>
  )
}

export function SearchPreviewSkeleton() {
  return (
    <SkeletonGroup className="divide-y divide-black/10">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2 px-4 py-3">
          <div className="flex justify-between gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </SkeletonGroup>
  )
}
