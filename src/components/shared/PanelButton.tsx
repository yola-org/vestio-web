"use client"

import type { ComponentProps } from "react"
import { useChatPanel } from "@/components/chats/ChatPanelProvider"
import { useOffersPanel } from "@/components/offers/OffersPanelProvider"
import { isAuthenticated } from "@/lib/auth"

export type PanelTarget = {
  type: "chat"
  chatId?: string
} | {
  type: "offers"
  direction?: "received" | "sent"
}

export default function PanelButton({
  panel,
  onClick,
  ...props
}: ComponentProps<"button"> & { panel: PanelTarget }) {
  const { openChat } = useChatPanel()
  const { openOffers } = useOffersPanel()
  return (
    <button
      {...props}
      type="button"
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || !isAuthenticated()) return
        if (panel.type === "chat") openChat(panel.chatId)
        else openOffers(panel.direction)
      }}
    />
  )
}
