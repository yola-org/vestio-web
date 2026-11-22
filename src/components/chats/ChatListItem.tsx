import PanelButton from "@/components/shared/PanelButton"
import { useTranslations } from "next-intl"
import ChatCover from "./ChatCover"
import CountBadge from "@/components/shared/CountBadge"
import { useRealtimeChat } from "@/components/shared/RealtimeProvider"
import ChatTime from "./ChatTime"
import { useChatMessageResolver } from "@/components/events/resolvers/chat-resolver"
import { getChatParticipantName, type Chat } from "@/lib/chat"

export default function ChatListItem({
  chat,
  selected,
  currentUserId,
}: {
  chat: Chat
  selected: boolean
  currentUserId?: string
}) {
  const t = useTranslations("chats")
  const { unreadByChat } = useRealtimeChat()
  const resolveMessage = useChatMessageResolver()
  return (
    <li>
      <PanelButton
        panel={{ type: "chat", chatId: chat.id }}
        aria-label={t("openChat", { title: chat.listingTitle })}
        aria-current={selected ? "page" : undefined}
        className={`group relative flex w-full text-start min-h-24 items-center gap-3 py-3 pe-3 ps-4 transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
          selected ? "bg-primary/5" : "hover:bg-primary/3"
        }`}
      >
        <ChatCover chat={chat} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold">
              {getChatParticipantName(chat, currentUserId)}
            </p>
            <CountBadge count={unreadByChat[chat.id] || 0} inline />
          </div>
          <h3 className="mt-0.5 truncate text-xs text-primary/60">
            {chat.listingTitle}
          </h3>
          <div className="mt-1 line-clamp-1 text-xs leading-5 text-primary/65">
            {chat.lastMessage
              ? resolveMessage(chat.lastMessage).content
              : t("emptyMessages")}
          </div>
          <ChatTime
            dateTime={chat.lastMessage?.createdAt ?? chat.createdAt}
            summary
            className="mt-1 block text-[10px] text-primary/40"
          />
        </div>
      </PanelButton>
    </li>
  )
}
