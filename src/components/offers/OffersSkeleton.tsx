import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"

export default function OffersSkeleton({ sent = false }: { sent?: boolean }) {
  return (
    <SkeletonGroup className="grid gap-4">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6" aria-hidden="true">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 sm:w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
          <Skeleton className="mt-3 h-4 w-24" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          {sent && (
            <div className="mt-4 flex gap-2 border-t border-black/10 pt-4">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>
          )}
        </div>
      ))}
    </SkeletonGroup>
  )
}
