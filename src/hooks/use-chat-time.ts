"use client"

import { useSyncExternalStore } from "react"
import { useLocale, useTranslations } from "next-intl"
import { chatTimeParts } from "@/lib/chat-time"

const listeners = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined
const update = () => listeners.forEach((listener) => listener())
function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1) {
    timer = setInterval(update, 60000)
    window.addEventListener("focus", update)
    document.addEventListener("visibilitychange", update)
  }
  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      clearInterval(timer)
      timer = undefined
      window.removeEventListener("focus", update)
      document.removeEventListener("visibilitychange", update)
    }
  }
}
const currentMinute = (): number | null => Math.floor(Date.now() / 60000)
const serverMinute = () => null

export function useChatTime(dateTime: string, summary: boolean) {
  const locale = useLocale()
  const t = useTranslations("chats.time")
  const minute = useSyncExternalStore(subscribe, currentMinute, serverMinute)
  const timeZone =
    minute === null ? "UTC" : Intl.DateTimeFormat().resolvedOptions().timeZone
  const parts = chatTimeParts(
    dateTime,
    minute === null ? null : minute * 60000,
    locale,
    timeZone,
  )
  const day =
    parts.daysAgo === 0
      ? t("today")
      : parts.daysAgo === 1
        ? t("yesterday")
        : parts.date
  return {
    text: summary
      ? parts.daysAgo !== null && parts.daysAgo !== 0 && parts.daysAgo !== 1
        ? new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(
            -parts.daysAgo,
            "day",
          )
        : day
      : t("at", { date: day, time: parts.time }),
    title: parts.title,
  }
}
