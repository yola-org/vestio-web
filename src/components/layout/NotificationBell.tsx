"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { BellIcon, CloseIcon } from "@/components/shared/Icons"
import NotificationFeed from "@/components/notifications/NotificationFeed"
import { useNotificationsPanel } from "@/components/notifications/NotificationsPanelProvider"
import { useRealtimeNotifications } from "@/components/shared/RealtimeProvider"
import CountBadge from "@/components/shared/CountBadge"
import { headerActionClassName } from "./header-styles"

export default function NotificationBell({ onOpen }: { onOpen?: () => void }) {
  const t = useTranslations("notifications")
  const { openNotifications } = useNotificationsPanel()
  const { unreadCount, markAllRead, refresh, saving } =
    useRealtimeNotifications()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener("pointerdown", outside)
    document.addEventListener("keydown", key)
    return () => {
      document.removeEventListener("pointerdown", outside)
      document.removeEventListener("keydown", key)
    }
  }, [open])

  return (
    <div ref={root} className="lg:relative">
      <button
        ref={trigger}
        data-notifications-trigger
        type="button"
        className={headerActionClassName}
        aria-label={t("bell", { count: unreadCount })}
        title={t("title")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (!open) {
            onOpen?.()
            refresh()
          }
          setOpen(!open)
        }}
      >
        <BellIcon className="size-5" />
        <CountBadge count={unreadCount} />
      </button>
      {open && (
        <section
          id={panelId}
          aria-label={t("title")}
          className="absolute start-4 end-4 top-full z-50 mt-3 lg:start-auto lg:end-0 lg:w-92 overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-primary/8 px-5 py-4">
            <h2 className="font-display text-lg font-extrabold">
              {t("title")}
            </h2>
            <button
              type="button"
              aria-label={t("close")}
              className="rounded-full p-2 hover:bg-black/5"
              onClick={() => {
                setOpen(false)
                trigger.current?.focus()
              }}
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="px-4 py-3 text-sm font-semibold text-accent hover:underline"
              disabled={saving}
              onClick={() => void markAllRead()}
            >
              {t("markAllRead")}
            </button>
          )}
          <div className="max-h-96 overflow-y-auto">
            <NotificationFeed preview onNavigate={() => setOpen(false)} />
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
              setOpen(false)
              openNotifications()
            }}
            className="w-full border-t border-primary/10 px-5 py-4 text-sm font-bold text-accent transition hover:bg-accent/5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          >
            {t("viewAll")}
          </button>
        </section>
      )}
    </div>
  )
}
