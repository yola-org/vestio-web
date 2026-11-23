"use client"

import { useTranslations } from "next-intl"
import { useChatMessages } from "@/hooks/use-chat-messages"
import { ArrowIcon } from "@/components/shared/Icons"
import ChatMessageItem from "@/components/chats/ChatMessageItem"
import { useChatMessageGroupsResolver } from "@/components/events/resolvers/chat-resolver"
import type { Chat } from "@/lib/chat"

export default function ChatMessages({
  chat,
  currentUserId,
  onSent,
}: {
  chat: Chat
  currentUserId?: string
  onSent: () => void
}) {
  const t = useTranslations("chats")
  const resolveGroups = useChatMessageGroupsResolver()
  const {
    data,
    error,
    loading,
    refetch,
    page,
    setPage,
    content,
    setContent,
    sending,
    sendError,
    send,
    scrollRef,
    onScroll,
    onKeyDown,
  } = useChatMessages(chat.id, onSent)

  return (
    <section aria-label={t("history")} className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8"
      >
        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-white p-4 text-center text-sm"
          >
            {t("loadError")}{" "}
            <button
              onClick={() => void refetch()}
              className="font-bold text-accent"
            >
              {t("retry")}
            </button>
          </p>
        ) : loading && !data ? (
          <p role="status" className="py-8 text-center text-sm text-primary/45">
            {t("loading")}
          </p>
        ) : (
          <>
            {data && data.totalPages > 1 && (
              <div className="mb-6 flex justify-center gap-4 text-xs">
                <button
                  disabled={page + 1 >= data.totalPages || loading}
                  onClick={() => setPage((value) => value + 1)}
                  className="rounded-full border border-primary/10 bg-white px-4 py-2 text-primary/60 disabled:opacity-30"
                >
                  {t("older")}
                </button>
                <button
                  disabled={page === 0 || loading}
                  onClick={() => setPage((value) => value - 1)}
                  className="rounded-full border border-primary/10 bg-white px-4 py-2 text-primary/60 disabled:opacity-30"
                >
                  {t("newer")}
                </button>
              </div>
            )}
            <ol className="space-y-5" aria-live="polite">
              {resolveGroups(data?.items ?? [], chat, currentUserId).map(
                (message) => (
                  <ChatMessageItem key={message.id} message={message} />
                ),
              )}
              {data?.items.length === 0 && (
                <li className="py-12 text-center text-sm text-primary/45">
                  {t("emptyMessages")}
                </li>
              )}
            </ol>
          </>
        )}
      </div>
      <form
        onSubmit={send}
        className="shrink-0 border-t border-primary/8 bg-white px-4 pb-4 pt-3 sm:px-6"
      >
        {sendError && (
          <p role="alert" className="mb-2 text-xs text-accent">
            {t("sendError")}
          </p>
        )}
        <label htmlFor="chat-message" className="sr-only">
          {t("message")}
        </label>
        <div className="flex items-end gap-3 rounded-2xl border border-primary/10 bg-background/60 p-2 focus-within:border-primary/30">
          <textarea
            id="chat-message"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={sending}
            maxLength={4000}
            required
            rows={2}
            placeholder={t("messagePlaceholder")}
            className="max-h-36 min-h-11 w-full resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-primary/35"
          />
          <button
            type="submit"
            aria-label={t(sending ? "sending" : "send")}
            disabled={sending || !content.trim()}
            className="mb-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:brightness-95 disabled:opacity-35"
          >
            <ArrowIcon
              className={`size-5 rtl:rotate-180 ${
                sending ? "animate-pulse" : ""
              }`}
            />
          </button>
        </div>
        <p className="mt-2 hidden text-[10px] text-primary/35 sm:block">
          {t("composerHint")}
        </p>
      </form>
    </section>
  )
}
