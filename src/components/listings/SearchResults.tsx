"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import ListingGrid from "@/components/shared/ListingGrid"
import { useFavorites } from "@/hooks/use-favorites"
import type { Listing } from "@/lib/api/schemas"

export default function SearchResults({
  listings,
  authenticated,
}: {
  listings: Listing[]
  authenticated: boolean
}) {
  const t = useTranslations("favorites")
  const router = useRouter()
  const favorites = useFavorites(authenticated)

  return (
    <>
      {favorites.error && (
        <div role="status" className="mb-4 flex flex-wrap gap-3 text-sm">
          <span>{t("loadError")}</span>
          <button
            type="button"
            className="font-bold text-deep-accent hover:underline"
            onClick={() => void favorites.refetch()}
          >
            {t("retry")}
          </button>
        </div>
      )}
      <ListingGrid
        listings={listings}
        columns="grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        savedIds={favorites.savedIds}
        saveDisabled={authenticated && (favorites.loading || favorites.saving)}
        onToggleSave={
          authenticated
            ? favorites.error
              ? undefined
              : favorites.toggle
            : () => router.push("/login")
        }
      />
    </>
  )
}
