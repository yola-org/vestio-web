"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { createPortal } from "react-dom"
import ToastNotification, {
  type Toast,
  type EventToast,
} from "@/components/notifications/ToastNotification"

type NotificationType = "success" | "error" | "info"
interface NotificationContextValue {
  notify: {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
    event: (toast: EventToast) => void
  }
}
const NotificationContext = createContext<NotificationContextValue | null>(null)
const MAX_VISIBLE_ALERTS = 3

export default function NotificationProvider({
  children,
}: {
  children: ReactNode
}) {
  const [notifications, setNotifications] = useState<Toast[]>([])
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const root = document.createElement("div")
    root.dataset.toastRoot = ""
    document.body.append(root)
    setPortalRoot(root)
    return () => root.remove()
  }, [])
  const dismiss = useCallback(
    (id: string) =>
      setNotifications((current) => current.filter((item) => item.id !== id)),
    [],
  )
  const enqueue = useCallback((toast: Toast) => {
    setNotifications((current) =>
      current.some((item) => item.id === toast.id)
        ? current
        : [...current, toast].slice(-MAX_VISIBLE_ALERTS),
    )
  }, [])
  const push = useCallback(
    (kind: NotificationType, message: string, translationKey?: string) => {
      const toast: Toast = {
        id: `local:${JSON.stringify([kind, translationKey ?? null, translationKey ? null : message])}`,
        kind,
        message,
        translationKey,
        duration: 5000,
      }
      enqueue(toast)
    },
    [enqueue],
  )
  const event = useCallback(
    (toast: EventToast) => enqueue({ ...toast, duration: 8000 }),
    [enqueue],
  )
  const notify = useMemo(
    () => ({
      success: (message: string) => push("success", message),
      error: (message: string) => push("error", message),
      info: (message: string) => push("info", message),
      event,
    }),
    [push, event],
  )

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const detail = (event as CustomEvent<{
        type: NotificationType
        message?: string
        key?: string
      }>).detail
      if (
        detail?.type &&
        ["success", "error", "info"].includes(detail.type) &&
        (detail.message || detail.key)
      )
        push(detail.type, detail.message ?? "", detail.key)
    }
    const reset = () => setNotifications([])
    window.addEventListener("vestio:notification", handleNotification)
    window.addEventListener("vestio:auth-changed", reset)
    return () => {
      window.removeEventListener("vestio:notification", handleNotification)
      window.removeEventListener("vestio:auth-changed", reset)
    }
  }, [push])

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {portalRoot &&
        createPortal(
          <div
            className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-1.5"
            aria-live="polite"
            aria-relevant="additions"
          >
            {notifications.map((toast) => (
              <ToastNotification
                key={toast.id}
                toast={toast}
                onDismiss={dismiss}
              />
            ))}
          </div>,
          portalRoot,
        )}
    </NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext)
  if (!context)
    throw new Error("useNotifications must be used within NotificationProvider")
  return context
}
