import {
  ListingSummarySchema,
  type Listing,
  type ListingSummary,
} from "@/lib/api/schemas"

/** Keep optimistic favorites in the same shape as the summary API. */
export function toListingSummary(
  listing: Listing | ListingSummary,
): ListingSummary {
  return ListingSummarySchema.parse({
    ...listing,
    descriptionPreview:
      "descriptionPreview" in listing
        ? listing.descriptionPreview
        : (listing.description?.slice(0, 160) ?? null),
    coverAssetKey:
      "coverAssetKey" in listing
        ? listing.coverAssetKey
        : (listing.assetKeys?.[0] ?? null),
    colors: listing.colors ?? [],
    cityNames: listing.cityNames ?? [],
    sizeNames: listing.sizeNames ?? [],
  })
}
