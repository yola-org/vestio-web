"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Modal from "@/components/shared/Modal"
import { ChevronIcon } from "@/components/shared/Icons"
import { getProfileAction } from "@/lib/actions/profile"
import { useApiQuery } from "@/hooks/use-api-query"
import { useFormatter, useTranslations } from "next-intl"
import { ArrowIcon } from "@/components/shared/Icons"
import OfferFormModal from "@/components/offers/OfferFormModal"
import FavoriteButton from "@/components/shared/FavoriteButton"
import { useFavorites } from "@/hooks/use-favorites"
import { createOfferAction, deleteListingAction } from "@/lib/actions/listings"
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

export function ListingDetailActions({
  listing,
  deliveryTypes,
  authenticated,
}: {
  deliveryTypes: ContactType[]
  listing: Listing
  authenticated: boolean
}) {
  const profile = useApiQuery(getProfileAction, {
    enabled: authenticated,
    loading: false,
  })
  const isOwner = Boolean(
    authenticated && listing.userId && profile.data?.id === listing.userId,
  )
  if (authenticated && profile.loading) return null
  if (isOwner) return <ListingDetailManage listing={listing} />
  return (
    <>
      {listing.status !== "SOLD" && deliveryTypes.length > 0 && (
        <ListingDetailOffer
          listingId={listing.id}
          title={listing.title}
          deliveryTypes={deliveryTypes}
          authenticated={authenticated}
        />
      )}
      <ListingDetailFavorite listing={listing} authenticated={authenticated} />
    </>
  )
}

function ListingDetailManage({ listing }: { listing: Listing }) {
  const t = useTranslations("listingDetail")
  const common = useTranslations("common")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", escape)
    }
  }, [open])

  async function remove() {
    if (deleting) return
    setDeleting(true)
    setError(false)
    try {
      const result = await deleteListingAction(listing.id)
      if (!result.success) {
        setError(true)
        return
      }
      router.push("/profile")
      router.refresh()
    } catch {
      setError(true)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        ref={container}
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
        }}
      >
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-95"
        >
          {t("manage")}{" "}
          <ChevronIcon
            aria-hidden="true"
            className={`size-4 transition ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div
            id={id}
            className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white py-2 shadow-xl"
          >
            <Link
              href={`/listings/${listing.id}/edit`}
              className="block px-5 py-3 text-sm font-bold hover:bg-background focus-visible:bg-background"
            >
              {t("edit")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setConfirming(true)
                setOpen(false)
                setError(false)
              }}
              className="block w-full px-5 py-3 text-start text-sm font-bold text-red-700 hover:bg-red-50 focus-visible:bg-red-50"
            >
              {t("delete")}
            </button>
          </div>
        )}
      </div>
      {confirming && (
        <Modal
          title={t("deleteTitle")}
          description={t("deleteDescription", { title: listing.title })}
          onClose={() => {
            setConfirming(false)
            requestAnimationFrame(() => trigger.current?.focus())
          }}
          dismissDisabled={deleting}
        >
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-700">
              {t("deleteError")}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                setConfirming(false)
                requestAnimationFrame(() => trigger.current?.focus())
              }}
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-bold disabled:opacity-50"
            >
              {common("cancel")}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void remove()}
              className="rounded-full bg-red-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {t(deleting ? "deleting" : "delete")}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
