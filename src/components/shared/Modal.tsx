"use client"

import { useEffect, useRef } from "react"
import { CloseIcon } from "./Icons"
import { useTranslations } from "next-intl"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const t = useTranslations()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-[#f7f3ea] shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-black/10">
          <h2 className="text-xl font-black">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition"
            aria-label={t("common.close")}
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
