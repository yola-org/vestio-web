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
import { usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

const HISTORY_KEY = "vestioNotificationsPanel"
interface NotificationsPanelContextValue {
  open: boolean
  openNotifications: () => void
  closeNotifications: () => void
}
const Context = createContext<NotificationsPanelContextValue | null>(null)

function currentPanel() {
  return (
    window.history.state?.[HISTORY_KEY]?.pathname ===
      window.location.pathname && isAuthenticated()
  )
}

export default function NotificationsPanelProvider({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const closing = useRef(false)
  const openNotifications = useCallback(() => {
    if (!isAuthenticated()) return
    window.dispatchEvent(
      new CustomEvent("vestio:panel-open", { detail: "notifications" }),
    )
    const state = {
      ...window.history.state,
      [HISTORY_KEY]: { pathname: window.location.pathname },
    }
    if (currentPanel())
      window.history.replaceState(state, "", window.location.href)
    else window.history.pushState(state, "", window.location.href)
    closing.current = false
    setOpen(true)
  }, [])
  const closeNotifications = useCallback(() => {
    if (closing.current) return
    closing.current = true
    if (currentPanel()) window.history.back()
    else {
      closing.current = false
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    const sync = () => {
      closing.current = false
      setOpen(currentPanel())
    }
    const reset = () => {
      const state = { ...window.history.state }
      delete state[HISTORY_KEY]
      window.history.replaceState(state, "", window.location.href)
      closing.current = false
      setOpen(false)
    }
    const otherPanel = (event: Event) => {
      if ((event as CustomEvent).detail !== "notifications") reset()
    }
    sync()
    window.addEventListener("popstate", sync)
    window.addEventListener("vestio:panel-open", otherPanel)
    window.addEventListener("vestio:auth-changed", reset)
    return () => {
      window.removeEventListener("popstate", sync)
      window.removeEventListener("vestio:panel-open", otherPanel)
      window.removeEventListener("vestio:auth-changed", reset)
    }
  }, [pathname])

  return (
    <Context.Provider value={{ open, openNotifications, closeNotifications }}>
      {children}
    </Context.Provider>
  )
}

export function useNotificationsPanel() {
  const value = useContext(Context)
  if (!value)
    throw new Error("useNotificationsPanel requires NotificationsPanelProvider")
  return value
}
