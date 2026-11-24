export const PUBLIC_PATHS = [
  "/welcome",
  "/search",
  "/categories",
  "/login",
  "/register",
  "/confirm-email",
  "/error",
]

export function isPublicPath(pathname: string) {
  if (/^\/listings\/(?!new$|pending$)[^/]+$/.test(pathname)) return true

  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  )
}
