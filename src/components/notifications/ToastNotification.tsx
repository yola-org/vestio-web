"use client"

import { useCallback, useEffect, useRef } from "react"
import NotificationAction, {
  type ActionTarget,
} from "@/components/shared/NotificationAction"
import { useTranslations } from "next-intl"
import {
  BellIcon,
  MessageIcon,
  CheckIcon,
  InfoIcon,
  WarningIcon,
  CloseIcon,
} from "@/components/shared/Icons"
import type { ReactNode } from "react"

export interface EventToast {
  id: string
  kind: "notification" | "chat"
  title: string
  content: ReactNode
  action?: ActionTarget & {
    label: string
    onClick?: () => void
  }
}
export interface Toast extends Omit<EventToast, "kind" | "title" | "content"> {
  kind: EventToast["kind"] | "success" | "error" | "info"
  title?: string
  content?: ReactNode
  message?: string
  translationKey?: string
  duration: number
}
const icons = {
  notification: BellIcon,
  chat: MessageIcon,
  success: CheckIcon,
  error: WarningIcon,
  info: InfoIcon,
}

interface ToastNotificationProps {
  toast: Toast
  onDismiss: (id: string) => void
}

export default function ToastNotification({
  toast,
  onDismiss,
}: ToastNotificationProps) {
  const t = useTranslations()
  const Icon = icons[toast.kind]
  const remaining = useRef(toast.duration)
  const started = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hovered = useRef(false)
  const focused = useRef(false)
  const pause = useCallback(() => {
    if (!timer.current) return
    clearTimeout(timer.current)
    timer.current = undefined
    remaining.current = Math.max(
      0,
      remaining.current - (Date.now() - started.current),
    )
  }, [])
  const resume = useCallback(() => {
    if (timer.current || hovered.current || focused.current) return
    started.current = Date.now()
    timer.current = setTimeout(() => onDismiss(toast.id), remaining.current)
  }, [toast.id, onDismiss])
  useEffect(() => {
    resume()
    return pause
  }, [resume, pause])

  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      data-toast-kind={toast.kind}
      onMouseEnter={() => {
        hovered.current = true
        pause()
      }}
      onMouseLeave={() => {
        hovered.current = false
        resume()
      }}
      onFocusCapture={() => {
        focused.current = true
        pause()
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          focused.current = false
          resume()
        }
      }}
      className="pointer-events-auto flex gap-3 rounded-2xl border border-primary/10 bg-white p-4 text-primary shadow-xl"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          toast.kind === "error"
            ? "bg-red-50 text-red-700"
            : toast.kind === "success"
              ? "bg-green-50 text-green-700"
              : "bg-accent/10 text-accent"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        {toast.title && <p className="mb-1 text-sm font-bold">{toast.title}</p>}
        <div className="line-clamp-3 break-words text-sm leading-6 text-primary/65">
          {toast.content ??
            (toast.translationKey ? t(toast.translationKey) : toast.message)}
        </div>
        {toast.action && (
          <NotificationAction
            target={toast.action}
            onClick={() => {
              toast.action?.onClick?.()
              onDismiss(toast.id)
            }}
            className="mt-2 inline-block text-xs font-bold text-accent underline underline-offset-4"
          >
            {toast.action.label}
          </NotificationAction>
        )}
      </div>
      <button
        type="button"
        aria-label={t("notifications.close")}
        onClick={() => onDismiss(toast.id)}
        className="-me-1 -mt-1 self-start rounded-full p-1.5 text-primary/40 transition hover:bg-background hover:text-primary"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  )
}
