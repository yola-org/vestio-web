"use client"

/**
 * Shows "Published X ago" for listings newer than 7 days,
 * and "Published on Jan 5, 2025" for older ones.
 * Renders nothing during SSR to avoid hydration mismatches.
 */

import { useSyncExternalStore } from "react"
import { useLocale, useTranslations } from "next-intl"

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default function PublishedDate({
  dateTime,
  className,
}: {
  dateTime: string
  className?: string
}) {
  const locale = useLocale()
  const t = useTranslations("listingDetail")
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  )

  if (!isClient) return null

  const date = new Date(dateTime)
  const diffMs = Date.now() - date.getTime()
  const isRecent = diffMs < SEVEN_DAYS_MS

  if (isRecent) {
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const relative =
      diffDays >= 1
        ? rtf.format(-diffDays, "day")
        : diffHours >= 1
          ? rtf.format(-diffHours, "hour")
          : diffMins >= 1
            ? rtf.format(-diffMins, "minute")
            : rtf.format(-diffSecs, "second")

    return <span className={className}>{t("publishedAgo", { relative })}</span>
  }

  const formatted = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(date)

  return (
    <span className={className}>{t("publishedOn", { date: formatted })}</span>
  )
}
