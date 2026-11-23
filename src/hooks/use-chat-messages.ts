"use client"

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { useApiQuery } from "@/hooks/use-api-query"
import {
  getChatMessagesAction,
  sendChatMessageAction,
} from "@/lib/actions/chats"
import { useRealtimeChat } from "@/components/shared/RealtimeProvider"

export function useChatMessages(chatId: string, onSent: () => void) {
  const { revision, watchChat } = useRealtimeChat()
  const [page, setPage] = useState(0)
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const busy = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const followLatest = useRef(true)
  const query = useApiQuery(() => getChatMessagesAction(chatId, page), {
    deps: [chatId, page, revision],
    loading: false,
  })
  const latestId = query.data?.items[0]?.id
  const hasLatestPage = page === 0 && query.data !== null && !query.error
  useEffect(() => {
    if (hasLatestPage) return watchChat(chatId)
  }, [chatId, hasLatestPage, watchChat])

  useEffect(() => {
    if (scrollRef.current && followLatest.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [latestId, page])

  function onScroll() {
    const element = scrollRef.current
    if (element)
      followLatest.current =
        element.scrollHeight - element.scrollTop - element.clientHeight < 80
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current || !content.trim() || content.length > 4000) return
    busy.current = true
    setSending(true)
    setSendError(false)
    try {
      const result = await sendChatMessageAction(chatId, content)
      if (!result.success) {
        setSendError(true)
        return
      }
      followLatest.current = true
      setContent("")
      setPage(0)
      if (page === 0) void query.refetch()
      onSent()
    } catch {
      setSendError(true)
    } finally {
      busy.current = false
      setSending(false)
    }
  }

  return {
    ...query,
    page,
    setPage,
    content,
    setContent,
    sending,
    sendError,
    send,
    scrollRef,
    onScroll,
    onKeyDown,
  }
}
