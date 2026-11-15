import type { ReactNode } from "react"
import { useTranslations } from "next-intl"

export default function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`skeleton-block animate-pulse bg-black/5 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonGroup({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const t = useTranslations("loading")

  return (
    <div role="status" aria-label={t("message")} className={className}>
      {children}
    </div>
  )
}
