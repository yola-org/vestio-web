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
  NotificationEventSchema,
  notificationsNamespace,
  type Notification,
  type RealtimeEvent,
} from "@/lib/realtime-events"
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/actions/notifications"
import { isAuthenticated } from "@/lib/auth"
import { logger } from "@/lib/logger"

interface InboxState {
  notifications: Notification[]
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
}
const empty: InboxState = {
  notifications: [],
  unreadCount: 0,
  page: 0,
  totalPages: 0,
  loading: false,
  loadingMore: false,
  saving: false,
  error: false,
}
const RealtimeContext = createContext<RealtimeContextValue | null>(null)

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
  const [state, setState] = useState<InboxState>(empty)
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
      const result = await getNotificationsAction(page)
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
      setState((value) => ({
        ...value,
        notifications: merge(value.notifications, data.items),
        unreadCount: data.unreadCount,
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
  }, [fetchPage])
  const loadMore = useCallback(() => {
    void fetchPage(true)
  }, [fetchPage])
  const reset = useCallback(() => {
    ++session.current
    ++request.current
    mutating.current = false
    setState(empty)
    refresh()
  }, [refresh])

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
    ({ channel, payload }: RealtimeEvent) => {
      if (
        !isAuthenticated() ||
        !channel.startsWith(`/${notificationsNamespace}/`)
      )
        return
      if (
        typeof payload !== "object" ||
        payload === null ||
        !("type" in payload) ||
        payload.type !== "notification"
      )
        return
      const result = NotificationEventSchema.safeParse(payload)
      if (!result.success) {
        logger.warn(
          "APPSYNC_NOTIFICATION",
          new Error("Notification payload does not match the backend contract"),
        )
        return
      }
      const item = {
        ...result.data.payload,
        createdAt: result.data.payload.createdAt ?? result.data.occurredAt,
      }
      setState((value) =>
        value.notifications.some((notification) => notification.id === item.id)
          ? value
          : {
              ...value,
              notifications: merge(value.notifications, [item]),
              unreadCount: value.unreadCount + (item.readAt ? 0 : 1),
            },
      )
      refresh()
    },
    [refresh],
  )

  const subscribed = useCallback(
    (channel: string) => {
      if (channel.startsWith(`/${notificationsNamespace}/`)) refresh()
    },
    [refresh],
  )

  const updateRead = useCallback(
    async (id?: string) => {
      if (!isAuthenticated() || mutating.current) return
      mutating.current = true
      const currentSession = session.current
      const knownIds = new Set(
        stateRef.current.notifications.map((item) => item.id),
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
        if (id) {
          const result = await markNotificationReadAction(id)
          if (!mounted.current || currentSession !== session.current) return
          if (!result.success) {
            setState((value) => ({ ...value, error: true }))
            return
          }
          setState((value) => ({
            ...value,
            notifications: merge(value.notifications, [result.data]),
          }))
        } else {
          const result = await markAllNotificationsReadAction()
          if (!mounted.current || currentSession !== session.current) return
          if (!result.success) {
            setState((value) => ({ ...value, error: true }))
            return
          }
          setState((value) => ({
            ...value,
            notifications: value.notifications.map((item) =>
              knownIds.has(item.id)
                ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
                : item,
            ),
          }))
        }
        await fetchPage()
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
  const markRead = useCallback((id: string) => updateRead(id), [updateRead])
  const markAllRead = useCallback(() => updateRead(), [updateRead])

  return (
    <RealtimeContext.Provider
      value={{ ...state, refresh, loadMore, markRead, markAllRead }}
    >
      <RealtimeListener
        onEvent={receive}
        onSessionChanged={reset}
        onSubscribed={subscribed}
      />
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeNotifications() {
  const value = useContext(RealtimeContext)
  if (!value)
    throw new Error("useRealtimeNotifications requires RealtimeProvider")
  return value
}
