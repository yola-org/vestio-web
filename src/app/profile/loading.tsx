import { ProfileContentSkeleton } from "@/components/profile/ProfileSkeleton"
import PageSkeleton from "@/components/shared/PageSkeleton"

export default function Loading() {
  return (
    <PageSkeleton>
      <main className="main-container pt-6 pb-12">
        <ProfileContentSkeleton />
      </main>
    </PageSkeleton>
  )
}
