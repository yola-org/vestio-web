import { assetsBaseUrl } from "./assets"

export function getProfileImageUrl(key?: string | null): string | undefined {
  if (
    !key ||
    !/^[0-9a-f-]{36}\/profile\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(key)
  )
    return undefined
  return `${assetsBaseUrl}/users/${key}`
}
