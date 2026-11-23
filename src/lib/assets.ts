const defaultBucket =
  process.env.NODE_ENV === "production" ? "vestio-assets" : "vestio-dev-assets"
export const assetsBaseUrl = (
  process.env.NEXT_PUBLIC_LISTING_ASSETS_BASE_URL?.trim() ||
  `https://${defaultBucket}.s3.ca-central-1.amazonaws.com`
).replace(/\/+$/, "")
