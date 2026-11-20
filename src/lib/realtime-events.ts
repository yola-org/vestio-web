import { z } from "zod"

export const NotificationSchema = z.object({
  id: z.uuid(),
  // Match the backend's canonical UUID format without imposing RFC version/variant bits.
  userId: z.guid(),
  type: z.string(),
  payload: z.record(z.string(), z.unknown()),
  listingId: z.uuid().nullish(),
  readAt: z.string().nullish(),
  createdAt: z.string().refine((value) => Number.isFinite(Date.parse(value))),
})
export type Notification = z.infer<typeof NotificationSchema>

// Shared keys from com.vestio.common.event.payload.OfferSentPayload.
export const OfferSentPayloadSchema = z.object({
  offerId: z.uuid(),
  amount: z.number().finite().positive(),
  senderId: z.guid(),
  senderName: z.string(),
  listingTitle: z.string(),
})

export const NotificationPageSchema = z.object({
  items: z.array(NotificationSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
})

// Matches Event with EventType.NOTIFICATION in vestio-common.
export const NotificationEventSchema = z.object({
  id: z.uuid(),
  type: z.literal("notification"),
  occurredAt: z.iso.datetime({ offset: true }),
  payload: NotificationSchema.extend({ createdAt: z.string().nullish() }),
})

export type NotificationEvent = z.infer<typeof NotificationEventSchema>
export interface RealtimeEvent {
  channel: string
  payload: unknown
}
export const notificationsNamespace =
  process.env.NEXT_PUBLIC_APPSYNC_EVENTS_NOTIFICATIONS_NAMESPACE ||
  "notifications"
