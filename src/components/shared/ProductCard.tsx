"use client"
// Helper to handle both mock data and real API Listing
import { PinIcon, ClockIcon } from "@/components/shared/Icons"
import FavoriteButton from "@/components/shared/FavoriteButton"
import ProfileAvatar from "@/components/shared/ProfileAvatar"
import type { Condition, ListingSummary } from "@/lib/api/schemas"
import { getListingImageUrls } from "@/lib/listing-images"
import { getProfileImageUrl } from "@/lib/profile-images"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useState } from "react"

const fallbackImage = "/listing-image-unavailable.png"
const visibleCityLimit = 2

interface ProductCardProps {
  product: ListingSummary | {
    title: string
    size: string
    condition?: Condition
    price: string | number
    city?: string
    cityNames?: string[]
    image: string
    seller: string
    colors?: string[]
  }
  isSaved: boolean
  href?: string
  onToggleSave?: () => void
  saveDisabled?: boolean
}

export default function ProductCard({
  product,
  isSaved,
  href,
  onToggleSave,
  saveDisabled,
}: ProductCardProps) {
  const t = useTranslations()
  const [failedImages, setFailedImages] = useState<string[]>([])
  const displaySize =
    "sizeNames" in product
      ? product.sizeNames?.join(", ") || ""
      : (product as any).size || ""
  const displayPrice =
    typeof product.price === "number"
      ? `${product.price} ${t("common.currency")}`
      : product.price
  const cityNames =
    product.cityNames ??
    ("city" in product && product.city ? [product.city] : [])
  const displayCities = cityNames
    .slice(0, visibleCityLimit)
    .join(t("productCard.citySeparator"))
  const hiddenCityCount = cityNames.length - visibleCityLimit
  const displaySeller =
    "userId" in product
      ? (product as any).seller || t("common.seller")
      : (product as any).seller
  const sellerFirstName =
    "sellerFirstName" in product ? product.sellerFirstName : undefined
  const sellerLastName =
    "sellerLastName" in product ? product.sellerLastName : undefined
  const sellerProfileImageKey =
    "sellerProfileImageKey" in product
      ? product.sellerProfileImageKey
      : undefined
  const sellerAvatarSrc = getProfileImageUrl(sellerProfileImageKey)
  const sellerName = sellerFirstName
    ? [sellerFirstName, sellerLastName].filter(Boolean).join(" ")
    : displaySeller
  const listing = "id" in product ? product : undefined
  const pendingLabel =
    listing?.status === "AWAITING_ASSETS"
      ? t("pendingListings.processingBadge")
      : listing?.status === "PENDING"
        ? t("pendingListings.pendingBadge")
        : undefined
  const imageSource = listing
    ? {
        id: listing.id,
        status: listing.status,
        assetKeys: listing.coverAssetKey ? [listing.coverAssetKey] : [],
      }
    : undefined
  const flatImage = imageSource
    ? getListingImageUrls(imageSource, "thumbnail")[0]
    : undefined
  const layout =
    flatImage && failedImages.includes(flatImage) ? "nested" : "flat"
  const image = imageSource
    ? getListingImageUrls(imageSource, "thumbnail", layout)[0]
    : "image" in product
      ? product.image?.trim()
      : undefined
  const mobileImage = imageSource
    ? getListingImageUrls(imageSource, "mobile", layout)[0]
    : undefined
  const showFallback = !image || failedImages.includes(image)
  const responsive = !showFallback && mobileImage && mobileImage !== image
  const cardImage = (
    <img
      key={image}
      src={showFallback ? fallbackImage : image}
      srcSet={responsive ? `${mobileImage} 480w, ${image} 960w` : undefined}
      sizes={responsive ? "(max-width: 639px) 50vw, 480px" : undefined}
      alt={product.title}
      onError={
        showFallback
          ? undefined
          : () => setFailedImages((failed) => [...failed, image])
      }
      className={
        showFallback
          ? "h-full w-full object-contain"
          : "h-full w-full object-cover"
      }
    />
  )
  return (
    <article className="group relative">
      <div
        className={`relative aspect-[4/5] overflow-hidden ${
          showFallback ? "bg-[#e9ecf0]" : "bg-[#e9e4d9]"
        }`}
      >
        {cardImage}
        {pendingLabel && (
          <span className="pointer-events-none absolute start-3 top-3 z-[2] inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-primary/15 bg-sub-accent px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
            <ClockIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{pendingLabel}</span>
          </span>
        )}
        {onToggleSave && (
          <FavoriteButton
            title={product.title}
            saved={isSaved}
            onToggle={onToggleSave}
            disabled={saveDisabled}
            compact
          />
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 start-3 z-[2] flex gap-1.5">
            {product.colors.map((color, index) => (
              <span
                key={index}
                className="h-3 w-3 rounded-full border border-white/50 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold">
              {href ? (
                <Link
                  href={href}
                  className="after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-deep-accent"
                >
                  {product.title}
                </Link>
              ) : (
                product.title
              )}
            </h3>
            {product.condition && (
              <p className="mt-1 text-xs text-black/50">
                {t(`conditions.${product.condition}.label`)}
              </p>
            )}
            {displaySize && (
              <p className="mt-1 text-xs text-black/50">{displaySize}</p>
            )}
          </div>
          <strong className="shrink-0">{displayPrice}</strong>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-black/10 pt-3 text-[11px] text-black/55">
          <span className="flex items-center gap-1.5 min-w-0">
            <ProfileAvatar
              src={sellerAvatarSrc}
              firstName={sellerFirstName ?? undefined}
              lastName={sellerLastName ?? undefined}
              size="sm"
              className="h-5 w-5 text-[8px]"
            />
            <span className="truncate">{sellerName}</span>
          </span>
          {displayCities && (
            <span
              className="flex items-center gap-1"
              title={
                hiddenCityCount > 0
                  ? cityNames.join(t("productCard.citySeparator"))
                  : undefined
              }
            >
              <PinIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {displayCities}
                {hiddenCityCount > 0 && (
                  <>
                    {" "}
                    <span className="whitespace-nowrap">
                      {t("productCard.moreCities", { count: hiddenCityCount })}
                    </span>
                  </>
                )}
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
