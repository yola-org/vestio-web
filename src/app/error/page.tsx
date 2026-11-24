"use client"

import FriendlyError from "@/components/shared/FriendlyError"

function retryPage() {
  let destination = "/"
  const returnTo = new URLSearchParams(window.location.search).get("returnTo")
  if (returnTo) {
    try {
      const target = new URL(returnTo, window.location.origin)
      const isErrorPage =
        target.pathname === "/error" || target.pathname.startsWith("/error/")
      if (target.origin === window.location.origin && !isErrorPage) {
        destination = target.href
      }
    } catch {
      destination = "/"
    }
  }
  window.location.assign(destination)
}

export default function ErrorPage() {
  return <FriendlyError onRetry={retryPage} />
}
