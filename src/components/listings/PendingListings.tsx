"use client"

import Link from "next/link"
import { useState } from "react"
import { useTranslations } from "next-intl"
import ListingGrid from "@/components/shared/ListingGrid"
import { useApiQuery } from "@/hooks/use-api-query"
import { listingsApi } from "@/lib/api"

const pageSize = 12
const pageButtonClass =
  "rounded-full border border-black/10 px-5 py-2 text-sm font-bold hover:bg-black/5 disabled:opacity-40"

export default function PendingListings({ columns }: { columns?: string }) {
  const t = useTranslations()
  const [page, setPage] = useState(0)
  const pending = useApiQuery(() => listingsApi.pending(page, pageSize), {
    deps: [page],
    loading: false,
  })
  const listings = pending.data ?? []
  const hasNextPage = !pending.error && listings.length === pageSize

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

      {(page > 0 || hasNextPage) && pending.error?.status !== 401 && (
        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            className={pageButtonClass}
            disabled={page === 0 || pending.loading}
            onClick={() => setPage(page - 1)}
          >
            {t("common.pagePrevious")}
          </button>
          <button
            type="button"
            className={pageButtonClass}
            disabled={!hasNextPage || pending.loading}
            onClick={() => setPage(page + 1)}
          >
            {t("common.pageNext")}
          </button>
        </div>
      )}
    </>
  )
}
