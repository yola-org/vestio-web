"use client"

import { useState } from "react"
import { useApiQuery } from "@/hooks/use-api-query"
import { getChatsAction, getChatViewerAction } from "@/lib/actions/chats"
import { useRealtimeChat } from "@/components/shared/RealtimeProvider"
import { isAuthenticated } from "@/lib/auth"

export function useChatInbox() {
  const { revision } = useRealtimeChat()
  const [page, setPage] = useState(0)
  const authenticated = isAuthenticated()
  const list = useApiQuery(() => getChatsAction(page), {
    deps: [page, revision],
    loading: false,
    enabled: authenticated,
  })
  const profile = useApiQuery(getChatViewerAction, {
    deps: [],
    loading: false,
    enabled: authenticated,
  })
  return { list, page, setPage, authenticated, currentUserId: profile.data?.id }
}
