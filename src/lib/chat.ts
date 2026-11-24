import { z } from "zod"
import { paginatedResponseSchema } from "@/lib/api/schemas"
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
export const ChatPageSchema = paginatedResponseSchema(ChatSchema)
export const MessagePageSchema = paginatedResponseSchema(MessageSchema)
