"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Loading from "@/app/loading"
import { isPublicPath } from "@/constants/routes"

export default function SessionBootstrap({
  needsRefresh,
  children,
}: {
  needsRefresh: boolean
  children: ReactNode
}) {
  const [ready, setReady] = useState(!needsRefresh)
  const refresh = useRef<Promise<Response> | null>(null)

  useEffect(() => {
    if (ready) return

    let active = true
    refresh.current ??= fetch("/api/auth/session", {
      method: "POST",
      signal: AbortSignal.timeout(7_000),
    })

    void refresh.current.catch(() => null).then((response) => {
      if (!active) return

      const { pathname } = window.location
      if (response?.status === 401 && !isPublicPath(pathname)) {
        window.location.replace(pathname === "/favorites" ? "/login" : "/welcome")
        return
      }
      setReady(true)
    })

    return () => {
      active = false
    }
  }, [ready])

  return ready ? children : <Loading />
}
