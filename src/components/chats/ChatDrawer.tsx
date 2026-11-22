"use client"
// The portal container stays mounted, so alert timers survive moving into the top layer.
import { useEffect, useId, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { CloseIcon, MessageIcon } from "@/components/shared/Icons"
import { useChatPanel } from "./ChatPanelProvider"
import ChatsInbox from "./ChatsInbox"

export default function ChatDrawer() {
  const { panel } = useChatPanel()
  return panel ? <Drawer chatId={panel.chatId} /> : null
}

function Drawer({ chatId }: { chatId?: string }) {
  const t = useTranslations("chats")
  const { closeChat } = useChatPanel()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [closing, setClosing] = useState(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement
    const overflow = document.documentElement.style.overflow
    const toastRoot = document.querySelector<HTMLElement>("[data-toast-root]")
    document.documentElement.style.overflow = "hidden"
    dialog.showModal()
    if (toastRoot) dialog.append(toastRoot)
    return () => {
      clearTimeout(timer.current)
      if (toastRoot) document.body.append(toastRoot)
      dialog.close()
      document.documentElement.style.overflow = overflow
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        previousFocus !== document.body &&
        previousFocus !== document.documentElement
      )
        previousFocus.focus({ preventScroll: true })
      else {
        const trigger = [
          ...document.querySelectorAll<HTMLElement>(
            "[data-chat-trigger], #header-mobile-toggle",
          ),
        ].find((element) => element.getClientRects().length)
        trigger?.focus({ preventScroll: true })
      }
    }
  }, [])

  function dismiss() {
    if (closing) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      closeChat()
      return
    }
    setClosing(true)
    timer.current = setTimeout(closeChat, 220)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-chat-panel
      data-closing={closing || undefined}
      onCancel={(event) => {
        event.preventDefault()
        dismiss()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          dismiss()
      }}
      className="chat-panel fixed inset-y-0 start-auto end-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-background p-0 text-primary shadow-2xl backdrop:bg-primary/40 backdrop:backdrop-blur-sm md:w-[calc(100vw-3rem)] md:max-w-[68rem]"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-primary/8 px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <MessageIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-xl font-extrabold">
              {t("title")}
            </h2>
            <p className="mt-0.5 text-xs text-primary/50">
              {t("inboxSubtitle")}
            </p>
          </div>
          <button
            autoFocus
            type="button"
            aria-label={t("close")}
            onClick={dismiss}
            className="rounded-full border border-primary/10 bg-white p-2.5 text-primary/60 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-accent"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>
        <ChatsInbox selectedId={chatId} />
      </div>
    </dialog>
  )
}
