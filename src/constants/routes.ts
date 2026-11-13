export const PUBLIC_PATHS = [
  "/welcome",
  "/search",
  "/login",
  "/register",
  "/500",
]

export function isPublicPath(pathname: string) {
  if (/^\/listings\/(?!new$|pending$)[^/]+$/.test(pathname)) return true

  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  )
}
