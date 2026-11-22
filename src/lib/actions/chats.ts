"use server"

import { z } from "zod"
import { request } from "@/lib/api/request"
import { runAction } from "@/lib/api/action-result"
import { ChatSchema, ChatPageSchema, MessagePageSchema } from "@/lib/chat"
import { MessageSchema } from "@/lib/realtime-events"

export async function getChatViewerAction() {
  return runAction(async () =>
    z.object({ id: z.string() }).parse(
      await request("/api/profile", { cache: "no-store" }),
    ),
  )
}

export async function getChatsAction(page = 0) {
  return runAction(async () =>
    ChatPageSchema.parse(
      await request(
        `/api/chats?page=${z.number().int().nonnegative().parse(page)}&size=20`,
        { cache: "no-store" },
      ),
    ),
  )
}

export async function getChatAction(id: string) {
  return runAction(async () =>
    ChatSchema.parse(
      await request(`/api/chats/${z.uuid().parse(id)}`, { cache: "no-store" }),
    ),
  )
}

export async function getChatMessagesAction(id: string, page = 0) {
  return runAction(async () =>
    MessagePageSchema.parse(
      await request(
        `/api/chats/${z.uuid().parse(id)}/messages?page=${z.number().int().nonnegative().parse(page)}&size=20`,
        { cache: "no-store" },
      ),
    ),
  )
}

export async function sendChatMessageAction(id: string, content: string) {
  return runAction(async () =>
    MessageSchema.parse(
      await request(`/api/chats/${z.uuid().parse(id)}/messages`, {
        method: "POST",
        body: JSON.stringify({
          content: z
            .string()
            .min(1)
            .max(4000)
            .refine((text) => text.trim().length > 0)
            .parse(content),
        }),
      }),
    ),
  )
}
