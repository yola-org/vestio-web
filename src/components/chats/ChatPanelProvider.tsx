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
import { z } from "zod"
import { isAuthenticated } from "@/lib/auth"

const HISTORY_KEY = "vestioChatPanel"
const HistoryPanel = z.object({
  pathname: z.string(),
  chatId: z.uuid().nullable(),
})
interface PanelState {
  chatId?: string
}
interface ChatPanelContextValue {
  panel: PanelState | null
  openChat: (id?: string) => void
  closeChat: () => void
}
const ChatPanelContext = createContext<ChatPanelContextValue | null>(null)
function currentPanel(): PanelState | null {
  const result = HistoryPanel.safeParse(window.history.state?.[HISTORY_KEY])
  if (
    !result.success ||
    result.data.pathname !== window.location.pathname ||
    !isAuthenticated()
  )
    return null
  return { chatId: result.data.chatId ?? undefined }
}

export default function ChatPanelProvider({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const [panel, setPanel] = useState<PanelState | null>(null)
  const closing = useRef(false)
  const openChat = useCallback((id?: string) => {
    if (!isAuthenticated()) return
    window.dispatchEvent(
      new CustomEvent("vestio:panel-open", { detail: "chat" }),
    )
    const state = {
      ...window.history.state,
      [HISTORY_KEY]: { pathname: window.location.pathname, chatId: id ?? null },
    }
    if (currentPanel())
      window.history.replaceState(state, "", window.location.href)
    else window.history.pushState(state, "", window.location.href)
    closing.current = false
    setPanel({ chatId: id })
  }, [])
  const closeChat = useCallback(() => {
    if (closing.current) return
    closing.current = true
    if (currentPanel()) window.history.back()
    else {
      closing.current = false
      setPanel(null)
    }
  }, [])

  useEffect(() => {
    const sync = () => {
      closing.current = false
      setPanel(currentPanel())
    }
    const reset = () => {
      const state = { ...window.history.state }
      delete state[HISTORY_KEY]
      window.history.replaceState(state, "", window.location.href)
      closing.current = false
      setPanel(null)
    }
    sync()
    const otherPanel = (event: Event) => {
      if ((event as CustomEvent).detail !== "chat") reset()
    }
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
    <ChatPanelContext.Provider value={{ panel, openChat, closeChat }}>
      {children}
    </ChatPanelContext.Provider>
  )
}

export function useChatPanel() {
  const value = useContext(ChatPanelContext)
  if (!value) throw new Error("useChatPanel requires ChatPanelProvider")
  return value
}
