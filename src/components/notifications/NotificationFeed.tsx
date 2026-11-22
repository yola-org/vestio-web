"use client"

import { useTranslations } from "next-intl"
import { useRealtimeNotifications } from "@/components/shared/RealtimeProvider"
import { useNotificationResolver } from "@/components/events/resolvers/notification-resolver"
import NotificationItem from "./NotificationItem"

export default function NotificationFeed({
  preview = false,
  onNavigate,
}: {
  preview?: boolean
  onNavigate: () => void
}) {
  const t = useTranslations("notifications")
  const resolveNotification = useNotificationResolver()
  const {
    notifications,
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
  const items = preview ? notifications.slice(0, 5) : notifications
  return (
    <div aria-busy={loading || loadingMore}>
      {error && (
        <div role="alert" className="px-5 py-4 text-sm">
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
      {!error && items.length === 0 && (
        <p className="px-5 py-10 text-center text-sm text-primary/60">
          {loading ? t("loading") : t("empty")}
        </p>
      )}
      <ul className="divide-y divide-primary/10">
        {items.map((item) => (
          <NotificationItem
            key={item.id}
            item={item}
            resolved={resolveNotification(item)}
            saving={saving}
            markRead={markRead}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
      {!preview && page + 1 < totalPages && (
        <button
          type="button"
          disabled={loading || loadingMore}
          onClick={loadMore}
          className="w-full border-t border-primary/10 px-5 py-4 text-sm font-semibold text-accent hover:bg-accent/5 disabled:opacity-50"
        >
          {loadingMore ? t("loading") : t("loadMore")}
        </button>
      )}
    </div>
  )
}
