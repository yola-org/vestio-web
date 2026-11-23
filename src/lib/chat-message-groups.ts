import type { ChatMessage } from "@/lib/realtime-events"

const GROUP_WINDOW_MS = 10 * 60 * 1000

/** Turns the API's newest-first page into chronological groups spanning at most ten minutes. */
export function groupChatMessages(
  messages: readonly ChatMessage[],
): ChatMessage[][] {
  const groups: ChatMessage[][] = []
  for (const message of [...messages].reverse()) {
    const group = groups[groups.length - 1]
    const first = group?.[0]
    const elapsed = first
      ? Date.parse(message.createdAt) - Date.parse(first.createdAt)
      : Infinity
    if (
      first &&
      !first.system &&
      !message.system &&
      first.chatId === message.chatId &&
      first.senderId === message.senderId &&
      elapsed >= 0 &&
      elapsed <= GROUP_WINDOW_MS
    ) {
      group.push(message)
    } else {
      groups.push([message])
    }
  }
  return groups
}
