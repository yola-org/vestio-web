import { assetsBaseUrl } from "./assets"
import type { Listing } from "@/lib/api/schemas"

const suffixes = {
  // Optimizer outputs: original 2560px, desktop 960px, mobile 480px (longest edge).
  original: [".webp", "/original.webp"],
  thumbnail: ["_thumbnail.webp", "/original-thumbnail.webp"],
  mobile: ["_thumbnail_mobile.webp", "/original-thumbnail-mobile.webp"],
} as const

export function getListingImageUrls(
  listing: Pick<Listing, "id" | "assetKeys" | "image" | "imageUrls" | "status">,
  rendition: keyof typeof suffixes = "original",
  layout: "flat" | "nested" = "flat",
): string[] {
  if (listing.status === "REJECTED_CONTENT") return []

  const suppliedUrls = [listing.image, ...(listing.imageUrls ?? [])]
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url))

  if (suppliedUrls.length) return [...new Set(suppliedUrls)]
  if (listing.status === "AWAITING_ASSETS") return []

  const prefix = `${assetsBaseUrl}/listings/${encodeURIComponent(listing.id)}`
  const suffix = suffixes[rendition][layout === "flat" ? 0 : 1]
  return [...new Set(listing.assetKeys ?? [])].map(
    (assetId) => `${prefix}/${encodeURIComponent(assetId)}${suffix}`,
  )
}
