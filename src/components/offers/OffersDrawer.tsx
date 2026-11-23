"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { CloseIcon, OfferIcon } from "@/components/shared/Icons"
import OffersList from "./OffersList"
import { useOffersPanel } from "./OffersPanelProvider"

export default function OffersDrawer() {
  const { panel } = useOffersPanel()
  return panel ? <Drawer /> : null
}

function Drawer() {
  const t = useTranslations("offers")
  const { panel, openOffers, closeOffers } = useOffersPanel()
  const direction = panel?.direction ?? "received"
  const dialogRef = useRef<HTMLDialogElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const tabId = useId()

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
            "[data-offers-trigger], #header-mobile-toggle",
          ),
        ].find((element) => element.getClientRects().length)
        trigger?.focus({ preventScroll: true })
      }
    }
  }, [])

  function dismiss() {
    if (closing) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      closeOffers()
      return
    }
    setClosing(true)
    timer.current = setTimeout(closeOffers, 220)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      data-offers-panel
      data-closing={closing || undefined}
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return
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
      className="offers-panel fixed inset-y-0 start-auto end-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-background p-0 text-primary shadow-2xl backdrop:bg-primary/40 backdrop:backdrop-blur-sm md:w-[calc(100vw-3rem)] md:max-w-2xl"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-primary/8 px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <OfferIcon className="size-5" />
          </span>
          <h2
            id={titleId}
            className="min-w-0 flex-1 font-display text-xl font-extrabold"
          >
            {t("title")}
          </h2>
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
        <nav
          aria-label={t("title")}
          className="flex shrink-0 gap-2 border-b border-primary/10 px-5 pt-4"
        >
          {(["received", "sent"] as const).map((type) => (
            <button
              key={type}
              id={`${tabId}-${type}`}
              type="button"
              aria-current={type === direction ? "page" : undefined}
              aria-controls={`${tabId}-content`}
              onClick={() => openOffers(type)}
              className="border-b-2 border-transparent px-3 pb-3 text-sm font-bold text-primary/65 hover:text-primary focus-visible:outline-2 focus-visible:outline-accent aria-[current=page]:border-accent aria-[current=page]:text-accent"
            >
              <span className="inline-block translate-y-px">{t(type)}</span>
            </button>
          ))}
        </nav>
        <section
          id={`${tabId}-content`}
          aria-labelledby={`${tabId}-${direction}`}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6"
        >
          <OffersList key={direction} direction={direction} />
        </section>
      </div>
    </dialog>
  )
}
