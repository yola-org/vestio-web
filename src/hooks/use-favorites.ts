"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useNotifications } from "@/components/shared/NotificationProvider"
import { useApiAction } from "@/hooks/use-api-action"
import { useApiQuery } from "@/hooks/use-api-query"
import { listingsApi, type Listing, type ListingSummary } from "@/lib/api"

import { toListingSummary } from "@/lib/listing-summary"

export function useFavorites(enabled = true) {
  const t = useTranslations("favorites")
  const { notify } = useNotifications()
  const [listings, setListings] = useState<ListingSummary[]>([])
  const saving = useRef(false)
  const query = useApiQuery(listingsApi.favorites, {
    enabled,
    deps: [enabled],
    loading: false,
    onSuccess: setListings,
  })
  const mutation = useApiAction(listingsApi.setFavorite, {
    loading: false,
    errors: {
      ERR_CANNOT_FAVORITE_OWN_LISTING: {
        message: t("ownListing"),
        action: (error) => {
          notify.error(error.message)
        },
      },
    },
  })
  const savedIds = listings.map(({ id }) => id)

  async function toggle(listing: Listing | ListingSummary) {
    if (
      !enabled ||
      !query.data ||
      query.loading ||
      query.error ||
      saving.current
    )
      return

    saving.current = true
    try {
      const save = !savedIds.includes(listing.id)
      const result = await mutation.execute(listing.id, save)
      if (result.success) {
        setListings((current) =>
          save
            ? [toListingSummary(listing), ...current]
            : current.filter(({ id }) => id !== listing.id),
        )
      }
    } finally {
      saving.current = false
    }
  }

  return {
    listings,
    savedIds,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch,
    saving: mutation.loading,
    toggle,
  }
}
