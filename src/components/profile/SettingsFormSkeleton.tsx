import Skeleton, { SkeletonGroup } from "@/components/shared/Skeleton"

export default function SettingsFormSkeleton() {
  return (
    <SkeletonGroup className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-[120px] rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="mt-10 h-12 rounded-full" />
    </SkeletonGroup>
  )
}
