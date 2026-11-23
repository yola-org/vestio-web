"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import RealtimeListener from "@/components/shared/RealtimeListener"
import {
  chatNamespace,
  type ChatMessage,
  notificationsNamespace,
  type Notification,
  type RealtimeEvent,
} from "@/lib/realtime-events"
import {
  getNotificationsAction,
  getUnreadOffersAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/notifications"
import { isAuthenticated } from "@/lib/auth"
import { resolveRealtimeEvent } from "@/lib/events/realtime-event-resolver"
import { useNotifications } from "@/components/shared/NotificationProvider"
import { useEventToastResolver } from "@/components/events/resolvers/event-toast-resolver"
import { useChatActivity } from "@/hooks/use-chat-activity"

interface InboxState {
  notifications: Notification[]
  unreadOffers: Notification[]
  unreadCount: number
  page: number
  totalPages: number
  loading: boolean
  loadingMore: boolean
  saving: boolean
  error: boolean
}
interface RealtimeContextValue extends InboxState {
  refresh: () => void
  loadMore: () => void
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  markOffersRead: (offerIds: string[]) => Promise<void>
}
const empty: InboxState = {
  notifications: [],
  unreadOffers: [],
  unreadCount: 0,
  page: 0,
  totalPages: 0,
  loading: false,
  loadingMore: false,
  saving: false,
  error: false,
}
const RealtimeContext = createContext<RealtimeContextValue | null>(null)
interface ChatEventsState {
  messages: ChatMessage[]
  revision: number
  session: number
}
interface ChatContextValue extends ChatEventsState {
  unreadByChat: Record<string, number>
  unreadCount: number
  watchChat: (id: string) => () => void
}
const ChatEventsContext = createContext<ChatContextValue | null>(null)

function merge(current: Notification[], incoming: Notification[]) {
  const byId = new Map(current.map((item) => [item.id, item]))
  for (const item of incoming) byId.set(item.id, item)
  return [...byId.values()].sort(
    (a, b) =>
      Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
      b.id.localeCompare(a.id),
  )
}

export default function RealtimeProvider({
  children,
}: {
  children: ReactNode
}) {
  const { notify } = useNotifications()
  const resolveToast = useEventToastResolver()
  const toastResolver = useRef(resolveToast)
  toastResolver.current = resolveToast
  const {
    unreadByChat,
    unreadCount: unreadChats,
    connect,
    incoming,
    watchChat,
    reset: resetChatActivity,
  } = useChatActivity()
  const seenEvents = useRef(new Set<string>())
  const pendingNotifications = useRef(new Map<string, Notification>())
  const markReadRef = useRef<(id: string) => Promise<void>>(async () => {})
  const [state, setState] = useState<InboxState>(empty)
  const [chatEvents, setChatEvents] = useState<ChatEventsState>({
    messages: [],
    revision: 0,
    session: 0,
  })
  const stateRef = useRef(state)
  stateRef.current = state
  const mounted = useRef(true)
  const session = useRef(0)
  const request = useRef(0)
  const mutating = useRef(false)

  const fetchPage = useCallback(async (more = false) => {
    if (!isAuthenticated()) return
    if (
      more &&
      (stateRef.current.loading ||
        stateRef.current.loadingMore ||
        stateRef.current.page + 1 >= stateRef.current.totalPages)
    )
      return
    const page = more ? stateRef.current.page + 1 : 0
    const current = ++request.current
    const currentSession = session.current
    setState((value) => ({
      ...value,
      loading: !more,
      loadingMore: more,
      error: false,
    }))
    try {
      const [result, offers] = await Promise.all([
        getNotificationsAction(page),
        getUnreadOffersAction(),
      ])
      if (
        !mounted.current ||
        current !== request.current ||
        currentSession !== session.current
      )
        return
      if (!isAuthenticated()) {
        setState(empty)
        return
      }
      if (!result.success) {
        setState((value) => ({ ...value, error: true }))
        return
      }
      const data = result.data
      for (const item of data.items)
        pendingNotifications.current.delete(item.id)
      const pendingUnread = [...pendingNotifications.current.values()].filter(
        (item) => !item.readAt,
      ).length
      setState((value) => ({
        ...value,
        notifications: merge(value.notifications, data.items),
        unreadOffers: offers.success
          ? merge(
              offers.data,
              [...pendingNotifications.current.values()].filter(
                (item) => item.type === "offer-sent" && !item.readAt,
              ),
            )
          : value.unreadOffers,
        unreadCount: data.unreadCount + pendingUnread,
        page: more
          ? data.page
          : Math.min(value.page, Math.max(0, data.totalPages - 1)),
        totalPages: data.totalPages,
      }))
    } catch {
      if (mounted.current && current === request.current)
        setState((value) => ({ ...value, error: true }))
    } finally {
      if (mounted.current && current === request.current)
        setState((value) => ({ ...value, loading: false, loadingMore: false }))
    }
  }, [])
  const refresh = useCallback(() => {
    void fetchPage()
    if (isAuthenticated())
      setChatEvents((value) => ({ ...value, revision: value.revision + 1 }))
  }, [fetchPage])
  const loadMore = useCallback(() => {
    void fetchPage(true)
  }, [fetchPage])
  const reset = useCallback(() => {
    ++session.current
    ++request.current
    mutating.current = false
    seenEvents.current.clear()
    pendingNotifications.current.clear()
    resetChatActivity()
    setState(empty)
    setChatEvents((value) => ({
      messages: [],
      revision: value.revision + 1,
      session: value.session + 1,
    }))
    refresh()
  }, [refresh, resetChatActivity])

  useEffect(() => {
    mounted.current = true
    refresh()
    window.addEventListener("focus", refresh)
    window.addEventListener("online", refresh)
    return () => {
      mounted.current = false
      ++session.current
      ++request.current
      window.removeEventListener("focus", refresh)
      window.removeEventListener("online", refresh)
    }
  }, [refresh])

  const receive = useCallback(
    (event: RealtimeEvent) => {
      if (!isAuthenticated()) return
      const resolved = resolveRealtimeEvent(event)
      if (!resolved) return
      const eventId =
        resolved.type === "chat"
          ? `chat:${resolved.message.id}`
          : `notification:${resolved.notification.id}`
      if (seenEvents.current.has(eventId)) return
      seenEvents.current.add(eventId)
      if (resolved.type === "chat") {
        const message = resolved.message
        const recipientId = event.channel.split("/").pop()!
        connect(recipientId)
        if (message.system || message.senderId !== recipientId) {
          incoming(message.chatId)
          notify.event(toastResolver.current(resolved))
        }
        setChatEvents((value) =>
          value.messages.some((item) => item.id === message.id)
            ? value
            : {
                ...value,
                messages: [...value.messages, message].slice(-100),
                revision: value.revision + 1,
              },
        )
        return
      }
      const item = resolved.notification
      const known = stateRef.current.notifications.find(
        (notification) => notification.id === item.id,
      )
      if (!known) pendingNotifications.current.set(item.id, item)
      if (!item.readAt && !known?.readAt) {
        const toast = toastResolver.current(resolved)
        notify.event({
          ...toast,
          action: toast.action
            ? {
                ...toast.action,
                onClick: () => {
                  void markReadRef.current(item.id)
                },
              }
            : undefined,
        })
      }
      setState((value) =>
        value.notifications.some((notification) => notification.id === item.id)
          ? value
          : {
              ...value,
              notifications: merge(value.notifications, [item]),
              unreadOffers:
                item.type === "offer-sent" && !item.readAt
                  ? merge(value.unreadOffers, [item])
                  : value.unreadOffers,
              unreadCount: value.unreadCount + (item.readAt ? 0 : 1),
            },
      )
      refresh()
    },
    [refresh, connect, incoming, notify],
  )

  const subscribed = useCallback(
    (channel: string) => {
      if (channel.startsWith(`/${notificationsNamespace}/`)) refresh()
      if (channel.startsWith(`/${chatNamespace}/`)) {
        connect(channel.split("/").pop()!)
        setChatEvents((value) => ({ ...value, revision: value.revision + 1 }))
      }
    },
    [refresh, connect],
  )

  const updateRead = useCallback(
    async (ids?: string[]) => {
      if (!isAuthenticated() || mutating.current) return
      mutating.current = true
      const currentSession = session.current
      const knownIds = new Set(
        [
          ...stateRef.current.notifications,
          ...stateRef.current.unreadOffers,
        ].map((item) => item.id),
      )
      ++request.current
      setState((value) => ({
        ...value,
        saving: true,
        loading: false,
        loadingMore: false,
        error: false,
      }))
      try {
        let readFailed = false
        if (ids) {
          const results = await Promise.all(ids.map(markNotificationReadAction))
          if (!mounted.current || currentSession !== session.current) return
          const read = results.flatMap((result) =>
            result.success ? [result.data] : [],
          )
          const readIds = new Set(read.map((item) => item.id))
          readFailed = results.some((result) => !result.success)
          for (const id of readIds) pendingNotifications.current.delete(id)
          setState((value) => ({
            ...value,
            error: readFailed,
            notifications: merge(value.notifications, read),
            unreadOffers: value.unreadOffers.filter(
              (item) => !readIds.has(item.id),
            ),
          }))
        } else {
          const result = await markAllNotificationsReadAction()
          if (!mounted.current || currentSession !== session.current) return
          if (!result.success) {
            setState((value) => ({ ...value, error: true }))
            return
          }
          for (const id of knownIds) pendingNotifications.current.delete(id)
          setState((value) => ({
            ...value,
            notifications: value.notifications.map((item) =>
              knownIds.has(item.id)
                ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
                : item,
            ),
            unreadOffers: value.unreadOffers.filter(
              (item) => !knownIds.has(item.id),
            ),
          }))
        }
        await fetchPage()
        if (readFailed && mounted.current && currentSession === session.current)
          setState((value) => ({ ...value, error: true }))
      } catch {
        if (mounted.current && currentSession === session.current)
          setState((value) => ({ ...value, error: true }))
      } finally {
        if (mounted.current && currentSession === session.current) {
          mutating.current = false
          setState((value) => ({ ...value, saving: false }))
        }
      }
    },
    [fetchPage],
  )
  const markRead = useCallback((id: string) => updateRead([id]), [updateRead])
  const markAllRead = useCallback(() => updateRead(), [updateRead])
  const markOffersRead = useCallback(
    (offerIds: string[]) => {
      const visible = new Set(offerIds)
      const ids = stateRef.current.unreadOffers
        .filter(
          (item) =>
            typeof item.payload.offerId === "string" &&
            visible.has(item.payload.offerId),
        )
        .map((item) => item.id)
      return ids.length ? updateRead(ids) : Promise.resolve()
    },
    [updateRead],
  )
  markReadRef.current = markRead

  return (
    <RealtimeContext.Provider
      value={{
        ...state,
        refresh,
        loadMore,
        markRead,
        markAllRead,
        markOffersRead,
      }}
    >
      <RealtimeListener
        onEvent={receive}
        onSessionChanged={reset}
        onSubscribed={subscribed}
      />
      <ChatEventsContext.Provider
        value={{
          ...chatEvents,
          unreadByChat,
          unreadCount: unreadChats,
          watchChat,
        }}
      >
        {children}
      </ChatEventsContext.Provider>
    </RealtimeContext.Provider>
  )
}

export function useRealtimeChat() {
  const value = useContext(ChatEventsContext)
  if (!value) throw new Error("useRealtimeChat requires RealtimeProvider")
  return value
}

export function useRealtimeNotifications() {
  const value = useContext(RealtimeContext)
  if (!value)
    throw new Error("useRealtimeNotifications requires RealtimeProvider")
  return value
}
