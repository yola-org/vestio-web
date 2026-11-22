"use client"

import Link from "next/link"
import PanelButton from "@/components/shared/PanelButton"
import { useTranslations } from "next-intl"
import { useApiQuery } from "@/hooks/use-api-query"
import { getChatAction } from "@/lib/actions/chats"
import { useRealtimeChat } from "@/components/shared/RealtimeProvider"
import { ArrowIcon } from "@/components/shared/Icons"
import { getChatParticipantName } from "@/lib/chat"
import ChatCover from "./ChatCover"
import ChatMessages from "./ChatMessages"

export default function ChatConversation({
  id,
  currentUserId,
  onSent,
}: {
  id: string
  currentUserId?: string
  onSent: () => void
}) {
  const t = useTranslations("chats")
  const { revision } = useRealtimeChat()
  const detail = useApiQuery(() => getChatAction(id), {
    deps: [id, revision],
    loading: false,
  })
  const chat = detail.data
  return (
    <section
      aria-label={t("conversation")}
      className="flex h-full min-h-0 flex-col"
    >
      <header className="flex min-h-23 shrink-0 items-center gap-3 border-b border-primary/8 bg-white px-4 py-4 sm:px-6">
        <PanelButton
          panel={{ type: "chat" }}
          aria-label={t("back")}
          className="rounded-full p-2 text-primary/60 hover:bg-background md:hidden"
        >
          <ArrowIcon className="size-5 rotate-180 rtl:rotate-0" />
        </PanelButton>
        {chat ? (
          <>
            <ChatCover chat={chat} className="size-12" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-extrabold">
                {getChatParticipantName(chat, currentUserId)}
              </h2>
              <p className="mt-0.5 truncate text-xs text-primary/55">
                {chat.listingTitle}
              </p>
            </div>
            <Link
              href={`/listings/${chat.listingId}`}
              className="hidden shrink-0 items-center gap-2 rounded-full border border-primary/10 px-4 py-2 text-xs font-bold transition hover:bg-background sm:flex"
            >
              {t("viewListing")}
              <ArrowIcon className="size-3.5 rtl:rotate-180" />
            </Link>
          </>
        ) : (
          <p className="text-sm text-primary/50">{t("loading")}</p>
        )}
      </header>
      {detail.error ? (
        <div role="alert" className="m-auto p-8 text-center text-sm">
          <p>{t("loadError")}</p>
          <button
            onClick={() => void detail.refetch()}
            className="mt-3 font-bold text-accent"
          >
            {t("retry")}
          </button>
        </div>
      ) : chat ? (
        <ChatMessages
          key={id}
          chat={chat}
          currentUserId={currentUserId}
          onSent={() => {
            void detail.refetch()
            onSent()
          }}
        />
      ) : (
        <div role="status" className="m-auto text-sm text-primary/50">
          {t("loading")}
        </div>
      )}
    </section>
  )
}
