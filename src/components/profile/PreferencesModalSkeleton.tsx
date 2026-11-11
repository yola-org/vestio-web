import Skeleton from "@/components/shared/Skeleton"

export default function PreferencesModalSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, j) => (
              <Skeleton key={j} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
