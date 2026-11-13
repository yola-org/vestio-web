"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { HeartIcon } from "@/components/shared/Icons"

export default function FavoriteButton({
  title,
  saved,
  disabled,
  compact,
  loginRequired,
  onToggle,
}: {
  title: string
  saved: boolean
  disabled?: boolean
  compact?: boolean
  loginRequired?: boolean
  onToggle: () => void
}) {
  const t = useTranslations()
  const className = compact
    ? `group/favorite absolute top-3 end-3 z-10 rounded-full p-2.5 backdrop-blur transition disabled:cursor-wait disabled:opacity-60 ${
        saved ? "bg-accent text-white" : "bg-white/90 hover:bg-white"
      }`
    : "group/favorite inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary px-5 py-3.5 text-sm font-bold transition hover:bg-primary/5 disabled:opacity-50"
  const label = t(saved ? "listingDetail.saved" : "listingDetail.save")
  const content = (
    <>
      <HeartIcon
        className={`size-5 transition-colors group-hover/favorite:fill-red-600 group-hover/favorite:text-red-600 group-focus-visible/favorite:fill-red-600 group-focus-visible/favorite:text-red-600 ${
          saved ? (compact ? "fill-current" : "fill-current text-accent") : ""
        }`}
      />
      {!compact && label}
    </>
  )

  if (loginRequired) {
    return (
      <Link href="/login" className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={className}
      aria-pressed={saved}
      aria-label={
        compact
          ? t(
              saved ? "productCard.removeFavorite" : "productCard.addFavorite",
              { title },
            )
          : undefined
      }
      disabled={disabled}
      onClick={onToggle}
    >
      {content}
    </button>
  )
}
