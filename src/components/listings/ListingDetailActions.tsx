"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import { ArrowIcon } from "@/components/shared/Icons"
import OfferFormModal from "@/components/offers/OfferFormModal"
import FavoriteButton from "@/components/shared/FavoriteButton"
import { useFavorites } from "@/hooks/use-favorites"
import { createOfferAction } from "@/lib/actions/listings"
import type { ContactType, Listing } from "@/lib/api/schemas"

function ListingDetailBackdrop({ photo }: { photo: string }) {
  const [loaded, setLoaded] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = imageRef.current
    if (image?.complete && image.naturalWidth > 0) setLoaded(true)
  }, [])

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 motion-reduce:transition-none ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        ref={imageRef}
        src={photo}
        alt=""
        className="absolute inset-0 size-full scale-105 object-cover opacity-80 blur-md"
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-black/55" />
    </div>
  )
}

export function ListingDetailCarousel({
  photos,
  legacyPhotos,
  title,
}: {
  photos: string[]
  legacyPhotos: string[]
  title: string
}) {
  const t = useTranslations("listingDetail")
  const [index, setIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<string[]>([])
  const photo = photos[index]
  const source =
    photo && failedImages.includes(photo) ? legacyPhotos[index] : photo
  const hasPhoto = source && !failedImages.includes(source)
  const canNavigate = photos.length > 1
  const controlClass =
    "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white text-primary shadow-sm transition enabled:hover:bg-background disabled:cursor-default disabled:opacity-50 sm:size-10"

  return (
    <div className="relative isolate aspect-[4/5] min-w-0 overflow-hidden border border-black/10 bg-[#e9ecf0] md:aspect-auto md:border-e-0">
      {hasPhoto && (
        <ListingDetailBackdrop key={`backdrop-${source}`} photo={source} />
      )}
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

export function ListingDetailOffer({
  listingId,
  title,
  deliveryTypes,
  authenticated,
}: {
  listingId: string
  title: string
  deliveryTypes: ContactType[]
  authenticated: boolean
}) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [sent, setSent] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-disabled={sent || undefined}
        onClick={() => {
          if (!sent) setIsOpen(true)
        }}
        className="rounded-full bg-accent px-5 py-3.5 text-center text-sm font-bold text-white transition hover:brightness-95 aria-disabled:opacity-60"
      >
        {t(sent ? "listingDetail.offerSent" : "listingDetail.sendOffer")}
      </button>
      <p role="status" className="sr-only">
        {sent && t("listingDetail.offerSent")}
      </p>
      {isOpen && (
        <OfferFormModal
          title={t("listingDetail.sendOffer")}
          submitLabel={t("listingDetail.offerSubmit")}
          listingTitle={title}
          deliveryTypes={deliveryTypes}
          authenticated={authenticated}
          onClose={() => setIsOpen(false)}
          onSubmit={(details) => createOfferAction({ listingId, ...details })}
          onSaved={() => {
            setIsOpen(false)
            setSent(true)
          }}
        />
      )}
    </>
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
