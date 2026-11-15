"use client"

import { useEffect, useId, useRef, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { CloseIcon } from "./Icons"

export default function Modal({
  title,
  description,
  onClose,
  dismissDisabled = false,
  children,
}: {
  title: string
  description?: string
  onClose: () => void
  dismissDisabled?: boolean
  children: ReactNode
}) {
  const t = useTranslations("common")
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousFocus = document.activeElement
    dialog.showModal()
    return () => {
      dialog.close()
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus()
      }
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        if (!dismissDisabled) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl bg-white p-6 text-primary shadow-xl backdrop:bg-black/45 sm:p-8"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-xl font-black">{title}</h2>
          {description && (
            <p id={descriptionId} className="mt-1 break-words text-sm text-primary/70">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={t("close")}
          disabled={dismissDisabled}
          onClick={onClose}
          className="-me-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full enabled:hover:bg-primary/5 disabled:opacity-60"
        >
          <CloseIcon aria-hidden="true" className="size-5" />
        </button>
      </div>
      {children}
    </dialog>
  )
}
