"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { ChevronIcon } from "./Icons"
import { useLocale, useTranslations } from "next-intl"
import { paginationPages } from "@/lib/pagination"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
  pageLinks?: Record<number, string>
  isLoading?: boolean
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageLinks,
  isLoading = false,
}: PaginationProps) {
  const t = useTranslations("common")
  const isRtl = useLocale() === "ar"
  if (totalPages <= 1) return null
  const pages = paginationPages(currentPage, totalPages)

  function control(
    page: number,
    content: ReactNode,
    label: string,
    disabled = false,
  ) {
    const selected = page === currentPage
    const className = `flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-accent ${
      selected
        ? "bg-deep-accent text-white"
        : "text-primary/70 hover:bg-black/5"
    } ${disabled || isLoading ? "opacity-30" : ""}`
    if (pageLinks?.[page] && !disabled && !isLoading)
      return (
        <Link
          href={pageLinks[page]}
          className={className}
          aria-label={label}
          aria-current={selected ? "page" : undefined}
        >
          {content}
        </Link>
      )
    return (
      <button
        type="button"
        className={className}
        aria-label={label}
        aria-current={selected ? "page" : undefined}
        disabled={disabled || isLoading}
        onClick={() => onPageChange?.(page)}
      >
        {content}
      </button>
    )
  }

  return (
    <nav
      aria-label={t("pagination")}
      aria-busy={isLoading}
      className="mt-8 flex flex-wrap items-center justify-center gap-1"
    >
      {control(
        currentPage - 1,
        <ChevronIcon
          aria-hidden="true"
          className={`h-5 w-5 ${isRtl ? "-rotate-90" : "rotate-90"}`}
        />,
        t("pagePrevious"),
        currentPage <= 1,
      )}
      {pages.map((page, index) => (
        <div key={page} className="flex items-center gap-1">
          {index > 0 && page - pages[index - 1] > 1 && (
            <span aria-hidden="true" className="px-1 text-primary/50">
              …
            </span>
          )}
          {control(page, page, t("pageNumber", { current: page }))}
        </div>
      ))}
      {control(
        currentPage + 1,
        <ChevronIcon
          aria-hidden="true"
          className={`h-5 w-5 ${isRtl ? "rotate-90" : "-rotate-90"}`}
        />,
        t("pageNext"),
        currentPage >= totalPages,
      )}
    </nav>
  )
}
