import {
  ChatEventSchema,
  NotificationEventSchema,
  chatNamespace,
  notificationsNamespace,
  type ChatMessage,
  type Notification,
  type RealtimeEvent,
} from "@/lib/realtime-events"
import { logger } from "@/lib/logger"

export type ResolvedRealtimeEvent = {
  type: "chat"
  message: ChatMessage
} | {
  type: "notification"
  notification: Notification
}

/** Validates the channel's event contract and normalizes data before state updates. */
export function resolveRealtimeEvent({
  channel,
  payload,
}: RealtimeEvent): ResolvedRealtimeEvent | null {
  if (channel.startsWith(`/${chatNamespace}/`)) {
    const result = ChatEventSchema.safeParse(payload)
    if (result.success) return { type: "chat", message: result.data.payload }
    logger.warn(
      "APPSYNC_CHAT",
      new Error("Chat payload does not match the backend contract"),
    )
    return null
  }
  if (!channel.startsWith(`/${notificationsNamespace}/`)) return null
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("type" in payload) ||
    payload.type !== "notification"
  )
    return null
  const result = NotificationEventSchema.safeParse(payload)
  if (!result.success) {
    logger.warn(
      "APPSYNC_NOTIFICATION",
      new Error("Notification payload does not match the backend contract"),
    )
    return null
  }
  return {
    type: "notification",
    notification: {
      ...result.data.payload,
      createdAt: result.data.payload.createdAt ?? result.data.occurredAt,
    },
  }
}
