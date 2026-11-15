import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"

export default function SellFormSkeleton() {
  return (
    <SkeletonGroup className="mx-auto max-w-3xl">
      <div className="mb-6 grid grid-cols-5 gap-1.5 sm:gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid justify-items-center gap-2 border-t-4 border-black/10 pt-3">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-black/10 bg-white shadow-sm">
        <div className="space-y-5 p-5 sm:p-8">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="flex justify-end border-t border-black/10 px-5 py-4 sm:px-8">
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </SkeletonGroup>
  )
}
