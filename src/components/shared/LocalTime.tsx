"use client"

/** UTC during SSR/hydration, then the browser's timezone for local display. */

import { useSyncExternalStore } from "react"
import { useLocale } from "next-intl"

const subscribe = () => () => {}
const browserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone
const serverTimeZone = () => "UTC"
export default function LocalTime({
  dateTime,
  className,
  showTime = false,
}: {
  dateTime: string
  className?: string
  showTime?: boolean
}) {
  const locale = useLocale()
  const timeZone = useSyncExternalStore(
    subscribe,
    browserTimeZone,
    serverTimeZone,
  )

  return (
    <time dateTime={dateTime} className={className}>
      {new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        ...(showTime ? { timeStyle: "short" as const } : {}),
        timeZone,
      }).format(new Date(dateTime))}
    </time>
  )
}
