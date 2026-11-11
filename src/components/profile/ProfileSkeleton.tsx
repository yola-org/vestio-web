import React from "react"
import Skeleton from "@/components/shared/Skeleton"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <Header />

      <main className="py-12 main-container">
        {/* Profile Header Card Skeleton */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-black/5 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar Skeleton */}
            <Skeleton className="h-32 w-32 rounded-full" />

            <div className="flex-1 w-full">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                {/* Name Skeleton */}
                <Skeleton className="h-10 w-48 rounded-lg" />
                {/* Edit Button Skeleton */}
                <Skeleton className="h-9 w-36 rounded-full" />
              </div>

              {/* Bio Skeleton */}
              <div className="space-y-2 mb-4 max-w-2xl">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>

              {/* Stats Skeleton */}
              <div className="flex gap-6">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs Skeleton */}
        <div className="mb-8 border-b border-black/10">
          <div className="flex gap-8">
            <div className="pb-4 w-24 border-b-2 border-[#173fdb]">
              <Skeleton className="h-5 w-full rounded" />
            </div>
            <div className="pb-4 w-20">
              <Skeleton className="h-5 w-full rounded" />
            </div>
            <div className="pb-4 w-20">
              <Skeleton className="h-5 w-full rounded" />
            </div>
          </div>
        </div>

        {/* Listings Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm"
            >
              {/* Image Skeleton */}
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <div className="p-4 space-y-2">
                {/* Title Skeleton */}
                <Skeleton className="h-4 w-3/4 rounded" />
                {/* Price Skeleton */}
                <Skeleton className="h-5 w-1/2 rounded" />
                {/* City Skeleton */}
                <Skeleton className="h-3 w-1/3 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
