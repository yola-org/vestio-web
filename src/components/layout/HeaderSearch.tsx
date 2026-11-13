"use client"

import { useEffect, useId, useState } from "react"
import Form from "next/form"
import { useFormatter, useTranslations } from "next-intl"
import { ArrowIcon, PinIcon, SearchIcon } from "@/components/shared/Icons"
import { searchListingsAction } from "@/lib/actions/listings"
import type { Listing } from "@/lib/api/schemas"

interface HeaderSearchProps {
  initialQuery: string
  filters: Record<string, string>
  mobile?: boolean
}

export default function HeaderSearch({
  initialQuery,
  filters,
  mobile = false,
}: HeaderSearchProps) {
  const t = useTranslations()
  const format = useFormatter()
  const previewId = useId()
  const [query, setQuery] = useState(initialQuery)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<{
    key: string
    listings: Listing[] | null
  }>()
  const term = query.trim()
  const showPreview = open && term.length >= 2
  const params = new URLSearchParams({ ...filters, query: term })
  const previewKey = params.toString()

  useEffect(() => {
    if (!showPreview) return

    let active = true
    const timer = window.setTimeout(async () => {
      try {
        const result = await searchListingsAction(
          Object.fromEntries(new URLSearchParams(previewKey)),
          0,
          5,
        )
        if (active) {
          setPreview({
            key: previewKey,
            listings: result.success ? result.data : null,
          })
        }
      } catch {
        if (active) setPreview({ key: previewKey, listings: null })
      }
    }, 250)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [previewKey, showPreview])

  const currentPreview = preview?.key === previewKey ? preview : undefined

  return (
    <Form
      action="/search"
      role="search"
      className={mobile ? "relative" : "relative min-w-0 flex-1"}
      onSubmit={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && showPreview) {
          event.preventDefault()
          setOpen(false)
        }
      }}
    >
      {Object.entries(filters).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        aria-label={t("search.submit")}
        className="absolute inset-y-0 start-0 grid w-12 place-items-center text-black/60 hover:text-deep-accent"
      >
        <SearchIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      <input
        type="search"
        name="query"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        autoComplete="off"
        aria-label={t("header.searchAria")}
        aria-controls={showPreview ? previewId : undefined}
        placeholder={t(
          mobile
            ? "header.mobileSearchPlaceholder"
            : "header.searchPlaceholder",
        )}
        className={`h-12 w-full pe-5 ps-12 text-sm outline-none ${
          mobile
            ? "rounded-xl border border-black/15 bg-white"
            : "bg-transparent"
        }`}
      />

      {showPreview && (
        <div
          id={previewId}
          className="absolute start-0 end-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white text-primary shadow-xl lg:end-auto lg:w-full lg:min-w-80"
        >
          <div className="border-b border-black/10 bg-background px-4 py-3">
            <p className="text-xs font-bold text-black/65">
              {t("search.previewTitle")}
            </p>
            <p className="truncate text-base font-black">{term}</p>
          </div>
          <div
            aria-live="polite"
            aria-busy={!currentPreview}
            className="max-h-[min(44dvh,25rem)] overflow-y-auto overscroll-contain"
          >
            {currentPreview?.listings?.length ? (
              <ul className="divide-y divide-black/10">
                {currentPreview.listings.map((listing) => (
                  <li key={listing.id} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p
                        className="min-w-0 truncate text-sm font-bold"
                        title={listing.title}
                      >
                        {listing.title}
                      </p>
                      <p className="shrink-0 whitespace-nowrap text-sm font-black text-deep-accent">
                        {format.number(listing.price)} {t("common.currency")}
                      </p>
                    </div>
                    {listing.description?.trim() && (
                      <p className="mt-1 line-clamp-1 text-xs text-black/65">
                        {listing.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-black/65">
                      <span className="rounded-md bg-deep-accent/8 px-2 py-0.5 font-semibold text-deep-accent">
                        {t(`conditions.${listing.condition}.short`)}
                      </span>
                      {listing.categoryName && (
                        <span>{listing.categoryName}</span>
                      )}
                      {!!listing.sizeNames?.length && (
                        <span>
                          {t("search.listingSize", {
                            sizes: format.list(listing.sizeNames, {
                              type: "unit",
                            }),
                          })}
                        </span>
                      )}
                      {!!listing.cityNames?.length && (
                        <span className="inline-flex max-w-full items-center gap-1">
                          <PinIcon
                            aria-hidden="true"
                            className="size-3.5 shrink-0"
                          />
                          <span className="truncate">
                            {listing.cityNames
                              .slice(0, 2)
                              .join(t("productCard.citySeparator"))}
                          </span>
                          {listing.cityNames.length > 2 && (
                            <span className="shrink-0">
                              +{format.number(listing.cityNames.length - 2)}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-sm text-black/65" role="status">
                {!currentPreview
                  ? t("common.loading")
                  : currentPreview.listings
                    ? t("listings.empty")
                    : t("search.loadError")}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-between gap-3 border-t border-black/10 bg-background px-4 py-3 text-start text-sm font-bold text-deep-accent transition hover:bg-deep-accent/5"
          >
            {t("search.viewResults")}
            <ArrowIcon aria-hidden="true" className="size-5 rtl:rotate-180" />
          </button>
        </div>
      )}
    </Form>
  )
}
