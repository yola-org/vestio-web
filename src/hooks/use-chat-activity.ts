"use client"

/** Per-tab incoming-event counts; persisted message history remains the REST API's job. */

import { useCallback, useEffect, useRef, useState } from "react"
import { z } from "zod"

const UnreadSchema = z.record(z.uuid(), z.number().int().nonnegative())
const storageKey = (userId: string) => `vestio:chat-unread:${userId}`
export function useChatActivity() {
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({})
  const user = useRef<string | null>(null)
  const active = useRef<string | null>(null)
  const counts = useRef(unreadByChat)

  const update = useCallback((next: Record<string, number>) => {
    counts.current = next
    setUnreadByChat(next)
    if (user.current) {
      try {
        sessionStorage.setItem(storageKey(user.current), JSON.stringify(next))
      } catch {}
    }
  }, [])

  const connect = useCallback(
    (userId: string) => {
      if (user.current === userId) return
      user.current = userId
      let saved: Record<string, number> = {}
      try {
        saved = UnreadSchema.parse(
          JSON.parse(sessionStorage.getItem(storageKey(userId)) || "{}"),
        )
      } catch {}
      if (
        active.current &&
        document.visibilityState === "visible" &&
        document.hasFocus()
      )
        delete saved[active.current]
      update(saved)
    },
    [update],
  )

  const markRead = useCallback(
    (id: string) => {
      if (!counts.current[id]) return
      const next = { ...counts.current }
      delete next[id]
      update(next)
    },
    [update],
  )

  const isViewing = useCallback(
    (id: string) =>
      active.current === id &&
      document.visibilityState === "visible" &&
      document.hasFocus(),
    [],
  )
  const watchChat = useCallback(
    (id: string) => {
      active.current = id
      if (isViewing(id)) markRead(id)
      return () => {
        if (active.current === id) active.current = null
      }
    },
    [isViewing, markRead],
  )

  const incoming = useCallback(
    (id: string) => {
      if (isViewing(id)) {
        markRead(id)
        return
      }
      update({ ...counts.current, [id]: (counts.current[id] || 0) + 1 })
    },
    [isViewing, markRead, update],
  )

  useEffect(() => {
    const readVisible = () => {
      if (active.current && isViewing(active.current)) markRead(active.current)
    }
    window.addEventListener("focus", readVisible)
    document.addEventListener("visibilitychange", readVisible)
    return () => {
      window.removeEventListener("focus", readVisible)
      document.removeEventListener("visibilitychange", readVisible)
    }
  }, [isViewing, markRead])

  const reset = useCallback(() => {
    user.current = null
    active.current = null
    counts.current = {}
    setUnreadByChat({})
  }, [])

  return {
    unreadByChat,
    unreadCount: Object.values(unreadByChat).reduce(
      (sum, count) => sum + count,
      0,
    ),
    connect,
    incoming,
    watchChat,
    reset,
  }
}
