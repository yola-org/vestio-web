export const PUBLIC_PATHS = [
  "/welcome",
  "/search",
  "/login",
  "/register",
  "/500",
]

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/"),
  )
}
