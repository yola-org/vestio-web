"use client"

/** Resolves message bodies for both the conversation and its last-message preview. */

import type { ReactNode } from "react"
import { useFormatter, useTranslations } from "next-intl"
import {
  OfferAcceptedPayloadSchema,
  type ChatMessage,
} from "@/lib/realtime-events"
import type { Chat } from "@/lib/chat"
import { groupChatMessages } from "@/lib/chat-message-groups"

export interface ResolvedChatMessage {
  id: string
  content: ReactNode
  system: boolean
  own: boolean
  senderName?: string
  createdAt: string
}

export interface ResolvedChatMessageGroup extends ResolvedChatMessage {
  messages: ResolvedChatMessage[]
}

export function useChatMessageGroupsResolver() {
  const resolveMessage = useChatMessageResolver()
  return (
    messages: readonly ChatMessage[],
    chat: Chat,
    currentUserId?: string,
  ): ResolvedChatMessageGroup[] =>
    groupChatMessages(messages).map((group) => {
      const parts = group.map((message) =>
        resolveMessage(message, chat, currentUserId),
      )
      const first = parts[0]
      return {
        ...first,
        messages: parts,
        createdAt: parts[parts.length - 1].createdAt,
      }
    })
}
export function useChatMessageResolver() {
  const t = useTranslations("chats")
  const format = useFormatter()

  return (
    message: ChatMessage,
    chat?: Chat,
    currentUserId?: string,
  ): ResolvedChatMessage => {
    let content: ReactNode
    if (!message.system) {
      content = (
        <span className="whitespace-pre-wrap break-words">
          {message.content}
        </span>
      )
    } else {
      const accepted =
        message.systemType === "offer-accepted"
          ? OfferAcceptedPayloadSchema.safeParse(message.params)
          : null
      if (accepted?.success) {
        const params = accepted.data
        content = (
          <span>
            {t("offerAccepted", {
              owner: params.ownerName,
              buyer: params.buyerName,
              title: params.listingTitle,
              amount: format.number(params.amount, {
                style: "currency",
                currency: params.currency,
              }),
            })}
          </span>
        )
      } else {
        content = <span>{t("systemMessage")}</span>
      }
    }
    return {
      id: message.id,
      content,
      system: message.system,
      own: !message.system && message.senderId === currentUserId,
      senderName:
        !message.system && chat
          ? message.senderId === chat.ownerId
            ? chat.ownerName
            : chat.buyerName
          : undefined,
      createdAt: message.createdAt,
    }
  }
}
