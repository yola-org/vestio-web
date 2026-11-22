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

type Direction = "received" | "sent"
const HISTORY_KEY = "vestioOffersPanel"
interface PanelState {
  direction: Direction
}
interface OffersPanelContextValue {
  panel: PanelState | null
  openOffers: (direction?: Direction) => void
  closeOffers: () => void
}
const OffersPanelContext = createContext<OffersPanelContextValue | null>(null)

function currentPanel(): PanelState | null {
  const value = window.history.state?.[HISTORY_KEY]
  if (
    !value ||
    value.pathname !== window.location.pathname ||
    (value.direction !== "received" && value.direction !== "sent") ||
    !isAuthenticated()
  )
    return null
  return { direction: value.direction }
}

export default function OffersPanelProvider({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const [panel, setPanel] = useState<PanelState | null>(null)
  const closing = useRef(false)
  const openOffers = useCallback((direction: Direction = "received") => {
    if (!isAuthenticated()) return
    window.dispatchEvent(
      new CustomEvent("vestio:panel-open", { detail: "offers" }),
    )
    const state = {
      ...window.history.state,
      [HISTORY_KEY]: { pathname: window.location.pathname, direction },
    }
    if (currentPanel())
      window.history.replaceState(state, "", window.location.href)
    else window.history.pushState(state, "", window.location.href)
    closing.current = false
    setPanel({ direction })
  }, [])
  const closeOffers = useCallback(() => {
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
      if ((event as CustomEvent).detail !== "offers") reset()
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
    <OffersPanelContext.Provider value={{ panel, openOffers, closeOffers }}>
      {children}
    </OffersPanelContext.Provider>
  )
}

export function useOffersPanel() {
  const value = useContext(OffersPanelContext)
  if (!value) throw new Error("useOffersPanel requires OffersPanelProvider")
  return value
}
