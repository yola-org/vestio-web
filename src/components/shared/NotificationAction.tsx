"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import PanelButton, { type PanelTarget } from "./PanelButton"

export type ActionTarget = { href: string } | { panel: PanelTarget }

export default function NotificationAction({
  target,
  children,
  className,
  onClick,
}: {
  target: ActionTarget
  children: ReactNode
  className?: string
  onClick: () => void
}) {
  return "panel" in target ? (
    <PanelButton panel={target.panel} className={className} onClick={onClick}>
      {children}
    </PanelButton>
  ) : (
    <Link href={target.href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
