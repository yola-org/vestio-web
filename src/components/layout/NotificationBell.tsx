"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { z } from "zod"
import { useFormatter, useTranslations } from "next-intl"
import LocalTime from "@/components/shared/LocalTime"
import { BellIcon, CloseIcon, CheckIcon } from "@/components/shared/Icons"
import { OfferSentPayloadSchema } from "@/lib/realtime-events"
import { useRealtimeNotifications } from "@/components/shared/RealtimeProvider"

export default function NotificationBell() {
  const t = useTranslations("notifications")
  const format = useFormatter()
  const common = useTranslations("common")
  const {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    refresh,
    loadMore,
    page,
    totalPages,
    loading,
    loadingMore,
    saving,
    error,
  } = useRealtimeNotifications()
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
        type="button"
        className="relative flex size-11 items-center justify-center rounded-full border border-black/15 hover:bg-deep-accent/5 focus-visible:outline-2 focus-visible:outline-accent"
        aria-label={t("bell", { count: unreadCount })}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (!open) refresh()
          setOpen(!open)
        }}
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -end-1 -top-1 min-w-5 rounded-full bg-accent px-1 text-xs font-bold leading-5 text-white"
          >
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <section
          id={panelId}
          aria-label={t("title")}
          className="absolute start-4 end-4 top-full z-50 mt-3 lg:start-auto lg:end-0 lg:w-92 overflow-hidden rounded-2xl border border-black/10 bg-background shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <h2 className="font-bold">{t("title")}</h2>
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
          <div
            className="max-h-96 overflow-y-auto"
            aria-busy={loading || loadingMore}
          >
            {error && (
              <div role="alert" className="px-4 py-3 text-sm">
                <p>{t("loadError")}</p>
                <button
                  type="button"
                  className="mt-2 font-semibold text-accent underline"
                  onClick={refresh}
                >
                  {t("retry")}
                </button>
              </div>
            )}
            {!error && notifications.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-black/60">
                {loading ? t("loading") : t("empty")}
              </p>
            )}
            <ul className="divide-y divide-black/10">
              {notifications.map((item) => {
                const read = Boolean(item.readAt)
                const isPending = item.type === "listing-created"
                const isReady = item.type === "listing-published"
                const listingId = z.uuid().safeParse(item.listingId).data
                const offerResult =
                  item.type === "offer-sent"
                    ? OfferSentPayloadSchema.safeParse(item.payload)
                    : undefined
                const offer = offerResult?.success
                  ? offerResult.data
                  : undefined
                return (
                  <li
                    key={item.id}
                    className={`flex gap-3 p-4 ${read ? "" : "bg-accent/5"}`}
                  >
                    <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <BellIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-sm ${
                          read ? "" : "font-semibold"
                        }`}
                      >
                        {offer
                          ? t("offerReceived", {
                              amount: format.number(offer.amount, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }),
                              currency: common("currency"),
                              sender:
                                offer.senderName.trim() || t("unknownSender"),
                              title: offer.listingTitle,
                            })
                          : isPending || isReady
                            ? t(isReady ? "listingReady" : "listingPending", {
                                title:
                                  typeof item.payload.listingTitle === "string"
                                    ? item.payload.listingTitle
                                    : "",
                              })
                            : t("newActivity")}
                      </p>
                      <LocalTime
                        dateTime={item.createdAt}
                        className="mt-1 block text-xs text-black/60"
                        showTime
                      />
                      {(offer || isPending || (isReady && listingId)) && (
                        <Link
                          href={
                            offer
                              ? "/offers/received"
                              : isReady
                                ? `/listings/${listingId}`
                                : "/listings/pending"
                          }
                          className="mt-2 inline-block text-sm font-semibold text-accent underline"
                          onClick={() => {
                            if (!read) void markRead(item.id)
                            setOpen(false)
                          }}
                        >
                          {t(
                            offer
                              ? "viewOffer"
                              : isReady
                                ? "viewReadyListing"
                                : "viewListing",
                          )}
                        </Link>
                      )}
                    </div>
                    {!read && (
                      <button
                        type="button"
                        disabled={saving}
                        className="self-start rounded-full p-2 text-accent hover:bg-accent/10 disabled:opacity-50"
                        aria-label={t("markRead")}
                        onClick={() => void markRead(item.id)}
                      >
                        <CheckIcon className="size-4" />
                      </button>
                    )}
                    {!read && (
                      <span
                        className="mt-2 size-2 shrink-0 rounded-full bg-accent"
                        aria-label={t("unread")}
                      />
                    )}
                  </li>
                )
              })}
            </ul>
            {page + 1 < totalPages && (
              <button
                type="button"
                disabled={loading || loadingMore}
                onClick={loadMore}
                className="w-full border-t border-black/10 px-4 py-3 text-sm font-semibold text-accent disabled:opacity-50"
              >
                {loadingMore ? t("loading") : t("loadMore")}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
