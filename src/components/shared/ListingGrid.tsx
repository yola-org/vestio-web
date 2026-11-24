"use client"

import ProductCard from "./ProductCard"
import type { ListingSummary } from "@/lib/api/schemas"
import { ListingGridSkeleton } from "./ListingSkeletons"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { OfferIcon } from "./Icons"

interface ListingGridProps {
  listings: ListingSummary[]
  isLoading?: boolean
  columns?: string
  emptyMessage?: string
  savedIds?: string[]
  onToggleSave?: (listing: ListingSummary) => void
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
      <div className="rounded-[2rem] border-2 border-dashed border-black/10 bg-white px-6 py-16 text-center sm:py-20">
        {emptyMessage ? (
          <p className="font-medium text-black/40">{emptyMessage}</p>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-deep-accent/10 text-deep-accent">
              <OfferIcon className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-primary">
              {t("listings.empty")}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-black/60">
              {t("listings.emptyDescription")}
            </p>
            <Link
              href="/listings/new"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-deep-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-deep-accent/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-deep-accent"
            >
              {t("listings.addProduct")}
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`grid ${columns} gap-x-4 gap-y-9 lg:gap-6`}>
      {listings.map((listing) => (
        <ProductCard
          key={listing.id}
          product={listing}
          href={
            !listing.status ||
            listing.status === "AVAILABLE" ||
            listing.status === "SOLD"
              ? `/listings/${encodeURIComponent(listing.id)}`
              : undefined
          }
          isSaved={savedIds.includes(listing.id)}
          onToggleSave={onToggleSave && (() => onToggleSave(listing))}
          saveDisabled={saveDisabled}
        />
      ))}
    </div>
  )
}
