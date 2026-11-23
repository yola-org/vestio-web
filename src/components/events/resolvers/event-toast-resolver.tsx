"use client"

import { useTranslations } from "next-intl"
import { useNotificationResolver } from "./notification-resolver"
import { useChatMessageResolver } from "./chat-resolver"
import type { ResolvedRealtimeEvent } from "@/lib/events/realtime-event-resolver"
import type { EventToast } from "@/components/notifications/ToastNotification"

export function useEventToastResolver() {
  const t = useTranslations()
  const notification = useNotificationResolver()
  const message = useChatMessageResolver()
  return (event: ResolvedRealtimeEvent): EventToast => {
    if (event.type === "notification") {
      const resolved = notification(event.notification)
      return {
        id: `notification:${event.notification.id}`,
        kind: "notification",
        title: t("notifications.title"),
        ...resolved,
      }
    }
    return {
      id: `chat:${event.message.id}`,
      kind: "chat",
      title: t("chats.newMessage"),
      content: message(event.message).content,
      action: {
        panel: { type: "chat", chatId: event.message.chatId },
        label: t("notifications.viewChat"),
      },
    }
  }
}
