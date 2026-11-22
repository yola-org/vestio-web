"use client"

import PanelButton from "@/components/shared/PanelButton"
import { useChatPanel } from "@/components/chats/ChatPanelProvider"
import { useTranslations } from "next-intl"
import { MessageIcon } from "@/components/shared/Icons"
import CountBadge from "@/components/shared/CountBadge"
import { useRealtimeChat } from "@/components/shared/RealtimeProvider"
import { headerActionClassName } from "./header-styles"

interface MessagesLinkProps {
  menu?: boolean
  onNavigate?: () => void
}

export default function MessagesLink({
  menu = false,
  onNavigate,
}: MessagesLinkProps) {
  const t = useTranslations("chats")
  const { panel } = useChatPanel()
  const { unreadCount } = useRealtimeChat()
  return (
    <PanelButton
      panel={{ type: "chat" }}
      onClick={onNavigate}
      title={t("title")}
      aria-label={unreadCount ? t("badge", { count: unreadCount }) : t("title")}
      aria-current={panel ? "page" : undefined}
      data-chat-trigger
      className={
        menu
          ? "relative flex items-center gap-3 rounded-2xl border border-primary/8 bg-background/50 px-4 py-4"
          : `${headerActionClassName} hidden lg:flex`
      }
    >
      <MessageIcon className="size-5 shrink-0" />
      {menu && t("title")}
      <CountBadge count={unreadCount} inline={menu} />
    </PanelButton>
  )
}
