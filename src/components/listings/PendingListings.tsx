"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRealtimeNotifications } from "@/components/shared/RealtimeProvider"
import { useTranslations } from "next-intl"
import Pagination from "@/components/shared/Pagination"
import ListingGrid from "@/components/shared/ListingGrid"
import { useApiQuery } from "@/hooks/use-api-query"
import { listingsApi } from "@/lib/api"

const pageSize = 12
export default function PendingListings({ columns }: { columns?: string }) {
  const t = useTranslations()
  const [page, setPage] = useState(0)
  const pending = useApiQuery(() => listingsApi.pending(page, pageSize), {
    deps: [page],
    loading: false,
    onSuccess: (result) => {
      if (page > 0 && page >= result.totalPages)
        setPage(Math.max(0, result.totalPages - 1))
    },
  })
  const { notifications } = useRealtimeNotifications()
  const statusNotifications = notifications
    .filter(
      (item) =>
        item.type === "listing-published" || item.type === "listing-refused",
    )
    .map((item) => item.id)
    .join(",")
  useEffect(() => {
    if (statusNotifications) void pending.refetch()
  }, [statusNotifications, pending.refetch])
  const listings = pending.data?.items ?? []

  return (
    <>
      {pending.error ? (
        <div
          className="rounded-[2rem] border border-black/10 bg-white p-8 text-center"
          role="status"
        >
          <p>{t("pendingListings.loadError")}</p>
          {pending.error.status === 401 ? (
            <Link
              href="/login"
              className="mt-4 inline-block font-bold text-deep-accent hover:underline"
            >
              {t("header.login")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => void pending.refetch()}
              className="mt-4 font-bold text-deep-accent hover:underline"
            >
              {t("pendingListings.retry")}
            </button>
          )}
        </div>
      ) : (
        <ListingGrid
          listings={listings}
          columns={columns}
          isLoading={pending.loading}
          emptyMessage={t(
            page === 0 ? "pendingListings.empty" : "pendingListings.emptyPage",
          )}
        />
      )}

      {!pending.error && (
        <Pagination
          currentPage={page + 1}
          totalPages={pending.data?.totalPages ?? 0}
          onPageChange={(page) => setPage(page - 1)}
          isLoading={pending.loading}
        />
      )}
    </>
  )
}
