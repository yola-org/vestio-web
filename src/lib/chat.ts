import { z } from "zod"
import { MessageSchema } from "@/lib/realtime-events"

export const ChatSchema = z.object({
  id: z.uuid(),
  offerId: z.uuid(),
  listingId: z.uuid(),
  listingTitle: z.string(),
  listingCoverAssetKey: z.uuid().nullable(),
  ownerId: z.guid(),
  ownerName: z.string(),
  buyerId: z.guid(),
  buyerName: z.string(),
  buyerProfileImageKey: z.string().nullish(),
  createdAt: z.iso.datetime({ offset: true }),
  lastMessage: MessageSchema.nullable(),
})
export type Chat = z.infer<typeof ChatSchema>

export function getChatParticipantName(
  chat: Chat,
  currentUserId?: string,
): string {
  if (currentUserId === chat.ownerId) return chat.buyerName
  if (currentUserId === chat.buyerId) return chat.ownerName
  return [chat.ownerName, chat.buyerName].filter(Boolean).join(" · ")
}
const pageFields = {
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
}
export const ChatPageSchema = z.object({
  ...pageFields,
  items: z.array(ChatSchema),
})
export const MessagePageSchema = z.object({
  ...pageFields,
  items: z.array(MessageSchema),
})
