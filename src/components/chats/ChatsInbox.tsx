"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useRealtimeChat } from "@/components/shared/RealtimeProvider"
import { useChatInbox } from "@/hooks/use-chat-inbox"
import { ArrowIcon, MessageIcon } from "@/components/shared/Icons"
import ChatListItem from "./ChatListItem"
import ChatConversation from "./ChatConversation"

interface ChatsInboxProps {
  selectedId?: string
}

export default function ChatsInbox({ selectedId }: ChatsInboxProps) {
  const { session } = useRealtimeChat()
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null
  return <Inbox key={session} id={selectedId} />
}

interface InboxProps {
  id?: string
}

function Inbox({ id }: InboxProps) {
  const t = useTranslations("chats")
  const { list, page, setPage, authenticated, currentUserId } = useChatInbox()
  if (!authenticated) return <Link href="/login">{t("login")}</Link>

  return (
    <div className="grid min-h-0 flex-1 overflow-hidden bg-white md:grid-cols-[320px_minmax(0,1fr)] lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside
        aria-label={t("title")}
        className={`${
          id ? "hidden md:flex" : "flex"
        } min-h-0 flex-col border-e border-primary/8`}
      >
        <div className="flex min-h-23 shrink-0 items-center justify-between gap-3 border-b border-primary/8 px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight">
              {t("inbox")}
            </h2>
            <p className="mt-1 text-xs text-primary/45">{t("inboxSubtitle")}</p>
          </div>
          {list.data && (
            <span className="flex size-8 items-center justify-center rounded-full bg-background text-xs font-bold text-primary/65">
              {list.data.totalElements}
            </span>
          )}
        </div>
        <nav aria-label={t("inbox")} className="min-h-0 flex-1 overflow-y-auto">
          {list.error ? (
            <div role="alert" className="p-5 text-sm">
              <p>{t("loadError")}</p>
              <button
                onClick={() => void list.refetch()}
                className="mt-3 font-bold text-accent"
              >
                {t("retry")}
              </button>
            </div>
          ) : list.loading && !list.data ? (
            <div
              role="status"
              className="space-y-3 p-3"
              aria-label={t("loading")}
            >
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex animate-pulse gap-3">
                  <div className="size-14 rounded-2xl bg-background" />
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-3 w-3/4 rounded bg-background" />
                    <div className="h-3 w-1/2 rounded bg-background" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ul className="py-3">
              {list.data?.items.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  selected={chat.id === id}
                  currentUserId={currentUserId}
                />
              ))}
            </ul>
          )}
          {list.data?.items.length === 0 && (
            <p className="px-5 py-10 text-center text-sm leading-6 text-primary/50">
              {t("empty")}
            </p>
          )}
        </nav>
        {list.data && list.data.totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-between border-t border-primary/8 px-5 py-3 text-xs">
            <button
              aria-label={t("previous")}
              disabled={page === 0 || list.loading}
              onClick={() => setPage((value) => value - 1)}
              className="rounded-full p-2 hover:bg-background disabled:opacity-25"
            >
              <ArrowIcon className="size-4 rotate-180 rtl:rotate-0" />
            </button>
            <span className="text-primary/45">
              {page + 1} / {list.data.totalPages}
            </span>
            <button
              aria-label={t("next")}
              disabled={page + 1 >= list.data.totalPages || list.loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-full p-2 hover:bg-background disabled:opacity-25"
            >
              <ArrowIcon className="size-4 rtl:rotate-180" />
            </button>
          </div>
        )}
      </aside>
      <div
        className={`${
          id ? "flex" : "hidden md:flex"
        } min-h-0 min-w-0 flex-col bg-background/40`}
      >
        {id ? (
          <ChatConversation
            key={id}
            id={id}
            currentUserId={currentUserId}
            onSent={() => void list.refetch()}
          />
        ) : (
          <div className="m-auto max-w-sm px-8 py-12 text-center">
            <div className="relative mx-auto mb-7 flex size-24 items-center justify-center rounded-3xl bg-muted-accent/25 text-primary/65">
              <MessageIcon className="size-10" />
              <span className="absolute -end-2 -top-2 size-6 rounded-full border-4 border-white bg-accent" />
            </div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              {t("selectConversation")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-primary/50">
              {t("selectHint")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
