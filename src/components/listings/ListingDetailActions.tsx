"use client"

import { useId, useState, type FormEvent } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { ArrowIcon } from "@/components/shared/Icons"
import FavoriteButton from "@/components/shared/FavoriteButton"
import { useFavorites } from "@/hooks/use-favorites"
import type { Listing } from "@/lib/api/schemas"

export function ListingDetailCarousel({
  image,
  imageUrls,
  title,
}: Pick<Listing, "image" | "imageUrls" | "title">) {
  const t = useTranslations("listingDetail")
  const [index, setIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<string[]>([])
  const photos = [
    ...new Set(
      [image, ...(imageUrls ?? [])].flatMap((url) => {
        const trimmed = url?.trim()
        return trimmed ? [trimmed] : []
      }),
    ),
  ]
  const source = photos[index]
  const hasPhoto = source && !failedImages.includes(source)
  const canNavigate = photos.length > 1
  const controlClass =
    "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white text-primary shadow-sm transition enabled:hover:bg-background disabled:cursor-default disabled:opacity-50 sm:size-10"

  return (
    <div className="relative aspect-[4/5] min-w-0 overflow-hidden border border-black/10 bg-[#e9ecf0] md:aspect-auto md:border-e-0">
      <img
        key={source}
        src={hasPhoto ? source : "/listing-image-unavailable.png"}
        alt={hasPhoto ? title : ""}
        className="absolute inset-0 h-full w-full object-contain"
        onError={
          hasPhoto
            ? () => setFailedImages((failed) => [...failed, source])
            : undefined
        }
      />
      <button
        type="button"
        aria-label={t("previousPhoto")}
        disabled={!canNavigate}
        onClick={() =>
          setIndex((current) => (current + photos.length - 1) % photos.length)
        }
        className={`${controlClass} start-3`}
      >
        <ArrowIcon aria-hidden="true" className="size-5 rotate-180" />
      </button>
      <button
        type="button"
        aria-label={t("nextPhoto")}
        disabled={!canNavigate}
        onClick={() => setIndex((current) => (current + 1) % photos.length)}
        className={`${controlClass} end-3`}
      >
        <ArrowIcon aria-hidden="true" className="size-5" />
      </button>
      {canNavigate && (
        <p
          className="absolute inset-x-0 bottom-3 text-center"
          aria-live="polite"
        >
          <span className="rounded-full bg-primary/80 px-3 py-1 text-xs font-bold text-white">
            {t("photoPosition", { current: index + 1, total: photos.length })}
          </span>
        </p>
      )}
    </div>
  )
}

export function ListingDetailOffer({ title }: Pick<Listing, "title">) {
  const t = useTranslations()
  const format = useFormatter()
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  async function copyOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(new FormData(event.currentTarget).get("amount"))
    if (!Number.isFinite(amount) || amount <= 0) return

    const offer = t("listingDetail.offerMessage", {
      amount: format.number(amount, { maximumFractionDigits: 2 }),
      currency: t("common.currency"),
      title,
      url: window.location.href,
    })
    setMessage(offer)
    try {
      await navigator.clipboard.writeText(offer)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <details>
      <summary className="cursor-pointer list-none rounded-full bg-accent px-5 py-3.5 text-center text-sm font-bold text-white transition hover:brightness-95 [&::-webkit-details-marker]:hidden">
        {t("listingDetail.sendOffer")}
      </summary>
      <form
        onSubmit={copyOffer}
        className="mt-3 grid gap-3 rounded-2xl border border-black/10 p-4 text-sm"
      >
        <label className="grid gap-1 font-bold">
          {t("listingDetail.offerAmount", { currency: t("common.currency") })}
          <input
            type="number"
            name="amount"
            required
            min="0.01"
            step="0.01"
            className="min-w-0 rounded-lg border border-black/20 px-3 py-2"
            onChange={() => {
              setMessage("")
              setCopied(false)
            }}
          />
        </label>
        <button
          type="submit"
          className="justify-self-start font-bold text-deep-accent hover:underline"
        >
          {t("listingDetail.copyOffer")}
        </button>
        {message && (
          <div className="grid gap-2">
            <p role="status">
              {t(
                copied
                  ? "listingDetail.offerCopied"
                  : "listingDetail.offerCopyManually",
              )}
            </p>
            <textarea
              aria-label={t("listingDetail.copyOffer")}
              className="w-full rounded-lg border border-black/20 p-2"
              readOnly
              rows={3}
              value={message}
            />
          </div>
        )}
      </form>
    </details>
  )
}

export function ListingDetailValues({
  label,
  values,
  swatches,
}: {
  label: string
  values: string[]
  swatches?: boolean
}) {
  const t = useTranslations("listingDetail")
  const format = useFormatter()
  const id = useId()
  const [expanded, setExpanded] = useState(false)
  const previewLimit = swatches ? 5 : 3
  const visible = expanded ? values : values.slice(0, previewLimit)

  if (!values.length) return null

  return (
    <div className="grid grid-cols-2 gap-3 py-2">
      <dt className="text-primary/70">{label}</dt>
      <dd className="min-w-0">
        {swatches ? (
          <ul id={id} className="flex flex-wrap gap-2">
            {visible.map((color) => (
              <li key={color}>
                <span
                  title={color}
                  className="block size-6 rounded-full border border-black/20"
                  style={{ backgroundColor: color }}
                >
                  <span className="sr-only">{color}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <span id={id} className="break-words font-bold">
            {format.list(visible, { type: "unit" })}
          </span>
        )}
        {values.length > previewLimit && (
          <button
            type="button"
            aria-controls={id}
            aria-expanded={expanded}
            className="mt-1 block text-xs font-bold text-deep-accent hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? t("showLess") : t("showAll", { count: values.length })}
          </button>
        )}
      </dd>
    </div>
  )
}

export function ListingDetailFavorite({
  listing,
  authenticated,
}: {
  listing: Listing
  authenticated: boolean
}) {
  const t = useTranslations()
  const favorites = useFavorites(authenticated)
  const saved = favorites.savedIds.includes(listing.id)
  if (favorites.error) {
    return (
      <div role="status" className="flex flex-wrap gap-3 text-sm">
        <span>{t("favorites.loadError")}</span>
        <button
          type="button"
          className="font-bold text-deep-accent hover:underline"
          onClick={() => void favorites.refetch()}
        >
          {t("favorites.retry")}
        </button>
      </div>
    )
  }

  return (
    <FavoriteButton
      title={listing.title}
      saved={saved}
      loginRequired={!authenticated}
      disabled={favorites.loading || favorites.saving}
      onToggle={() => void favorites.toggle(listing)}
    />
  )
}
