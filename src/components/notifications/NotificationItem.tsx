"use client"

import NotificationAction from "@/components/shared/NotificationAction"
import { useTranslations } from "next-intl"
import LocalTime from "@/components/shared/LocalTime"
import { BellIcon, CheckIcon } from "@/components/shared/Icons"
import type { Notification } from "@/lib/realtime-events"
import type { ResolvedNotification } from "@/components/events/resolvers/notification-resolver"

interface NotificationItemProps {
  item: Notification
  resolved: ResolvedNotification
  saving: boolean
  markRead: (id: string) => Promise<void>
  onNavigate: () => void
}

export default function NotificationItem({
  item,
  resolved,
  saving,
  markRead,
  onNavigate,
}: NotificationItemProps) {
  const t = useTranslations("notifications")
  const read = Boolean(item.readAt)
  return (
    <li className={`flex gap-3 p-4 ${read ? "" : "bg-accent/5"}`}>
      <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
        <BellIcon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`break-words text-sm ${read ? "" : "font-semibold"}`}>
          {resolved.content}
        </p>
        <LocalTime
          dateTime={item.createdAt}
          className="mt-1 block text-xs text-black/60"
          showTime
        />
        {resolved.action && (
          <NotificationAction
            target={resolved.action}
            className="mt-2 inline-block text-sm font-semibold text-accent underline"
            onClick={() => {
              if (!read) void markRead(item.id)
              onNavigate()
            }}
          >
            {resolved.action.label}
          </NotificationAction>
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
}
