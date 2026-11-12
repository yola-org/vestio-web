"use client"
// Helper to handle both mock data and real API Listing
import { HeartIcon, PinIcon } from "@/components/shared/Icons"
import type { Condition, Listing } from "@/lib/api/schemas"
import { useTranslations } from "next-intl"
import { useState } from "react"

const fallbackImage = "/listing-image-unavailable.png"
const visibleCityLimit = 2

interface ProductCardProps {
  product: Listing | {
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
  onToggleSave?: () => void
}

export default function ProductCard({
  product,
  isSaved,
  onToggleSave,
}: ProductCardProps) {
  const t = useTranslations()
  const [failedImage, setFailedImage] = useState<string>()
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
  const image = "image" in product ? product.image?.trim() : undefined
  const showFallback = !image || image === failedImage
  return (
    <article className="group">
      <div
        className={`relative aspect-[4/5] overflow-hidden ${
          showFallback ? "bg-[#e9ecf0]" : "bg-[#e9e4d9]"
        }`}
      >
        <img
          key={image}
          src={showFallback ? fallbackImage : image}
          alt={product.title}
          onError={showFallback ? undefined : () => setFailedImage(image)}
          className={
            showFallback
              ? "h-full w-full object-contain"
              : "h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          }
        />
        <span className="absolute top-3 start-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur">
          {t("common.secondHand")}
        </span>
        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            className={`absolute top-3 end-3 rounded-full p-2.5 backdrop-blur transition ${
              isSaved ? "bg-[#ff5d39] text-white" : "bg-white/90 hover:bg-white"
            }`}
            aria-label={
              isSaved
                ? t("productCard.removeFavorite", { title: product.title })
                : t("productCard.addFavorite", { title: product.title })
            }
          >
            <HeartIcon className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </button>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-3 start-3 flex gap-1.5">
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
            <h3 className="font-bold">{product.title}</h3>
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
          <span>{displaySeller}</span>
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
