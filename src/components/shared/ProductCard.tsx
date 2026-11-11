"use client"
// Helper to handle both mock data and real API Listing
import { HeartIcon, PinIcon } from "@/components/shared/Icons"
import type { Listing } from "@/lib/api/schemas"
import { useTranslations } from "next-intl"

interface ProductCardProps {
  product: Listing | {
    title: string
    size: string
    price: string | number
    city: string
    image: string
    seller: string
    colors?: string[]
  }
  isSaved: boolean
  onToggleSave: () => void
}

export default function ProductCard({
  product,
  isSaved,
  onToggleSave,
}: ProductCardProps) {
  const t = useTranslations()
  const displaySize =
    "sizeNames" in product
      ? product.sizeNames?.join(", ") || ""
      : (product as any).size || ""
  const displayPrice =
    typeof product.price === "number"
      ? `${product.price} ${t("common.currency")}`
      : product.price
  const displayCity =
    "cityNames" in product
      ? product.cityNames?.join(", ") || ""
      : (product as any).city
  const displaySeller =
    "userId" in product
      ? (product as any).seller || t("common.seller")
      : (product as any).seller
  const displayImage =
    (product as any).image ||
    "https://images.unsplash.com/photo-1511556820780-d912e42b4980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900"
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e4d9]">
        <img
          src={displayImage}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 start-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur">
          {t("common.secondHand")}
        </span>
        <button
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
            <p className="mt-1 text-xs text-black/50">{displaySize}</p>
          </div>
          <strong className="shrink-0">{displayPrice}</strong>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[11px] text-black/55">
          <span>{displaySeller}</span>
          <span className="flex items-center gap-1">
            <PinIcon className="h-3.5 w-3.5" />
            {displayCity}
          </span>
        </div>
      </div>
    </article>
  )
}
