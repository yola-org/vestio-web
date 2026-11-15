import { ProfileContentSkeleton } from "@/components/profile/ProfileSkeleton"
import PageSkeleton from "@/components/shared/PageSkeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <main className="main-container py-12">
        <ProfileContentSkeleton />
      </main>
    </PageSkeleton>
  )
}
