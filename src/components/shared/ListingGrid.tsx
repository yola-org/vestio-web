"use client"

import ProductCard from "./ProductCard"
import type { Listing } from "@/lib/api/schemas"
import { ListingGridSkeleton } from "./ListingSkeletons"
import { useTranslations } from "next-intl"

interface ListingGridProps {
  listings: Listing[]
  isLoading?: boolean
  columns?: string
  emptyMessage?: string
  savedIds?: string[]
  onToggleSave?: (listing: Listing) => void
  saveDisabled?: boolean
}

export default function ListingGrid({
  listings = [],
  isLoading = false,
  columns = "grid-cols-2 lg:grid-cols-4",
  emptyMessage,
  savedIds = [],
  onToggleSave,
  saveDisabled,
}: ListingGridProps) {
  const t = useTranslations()

  if (isLoading) {
    return <ListingGridSkeleton count={8} columns={columns} />
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-black/10">
        <p className="text-black/40 font-medium">
          {emptyMessage ?? t("listings.empty")}
        </p>
      </div>
    )
  }

  return (
    <div className={`grid ${columns} gap-x-4 gap-y-9 lg:gap-6`}>
      {listings.map((listing) => (
        <ProductCard
          key={listing.id}
          product={listing}
          isSaved={savedIds.includes(listing.id)}
          onToggleSave={onToggleSave && (() => onToggleSave(listing))}
          saveDisabled={saveDisabled}
        />
      ))}
    </div>
  )
}
