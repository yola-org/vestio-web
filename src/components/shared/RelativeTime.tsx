"use client"

/** Renders a human-readable relative time (e.g. "3 days ago").
 *  Falls back to an empty string during SSR to avoid hydration mismatches. */

import { useSyncExternalStore } from "react"
import { useLocale } from "next-intl"

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

function getRelativeLabel(locale: string, date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  if (diffDays >= 1) return rtf.format(-diffDays, "day")
  if (diffHours >= 1) return rtf.format(-diffHours, "hour")
  if (diffMins >= 1) return rtf.format(-diffMins, "minute")
  return rtf.format(-diffSecs, "second")
}

export default function RelativeTime({
  dateTime,
  className,
}: {
  dateTime: string
  className?: string
}) {
  const locale = useLocale()
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  )

  if (!isClient) return null

  return (
    <span className={className}>
      {getRelativeLabel(locale, new Date(dateTime))}
    </span>
  )
}
