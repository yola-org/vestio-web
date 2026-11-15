import type { ReactNode } from "react"
import Skeleton from "@/components/shared/Skeleton"

export default function PageSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div aria-hidden="true" className="border-b border-black/10">
        <div className="h-8 bg-deep-accent/10" />
        <div className="main-container flex items-center gap-5 py-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-12 flex-1 rounded-full" />
          <Skeleton className="hidden size-10 rounded-full sm:block" />
        </div>
        <div className="main-container hidden gap-6 py-4 lg:flex">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      {children}
    </div>
  )
}
