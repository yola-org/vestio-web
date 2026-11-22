"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  UserIcon,
  UploadIcon,
  MenuIcon,
  CloseIcon,
} from "@/components/shared/Icons"
import NotificationBell from "./NotificationBell"
import MessagesLink from "./MessagesLink"
import OffersLink from "./OffersLink"
import CountBadge from "@/components/shared/CountBadge"
import { useRealtimeChat } from "@/components/shared/RealtimeProvider"
import UserDropdown from "./UserDropdown"
import { headerActionClassName } from "./header-styles"
import type { AccountDisplayName } from "@/lib/api/schemas"

interface HeaderActionsProps {
  authenticated: boolean
  displayName?: AccountDisplayName
  mobileOpen: boolean
  onMenuToggle: () => void
}

export default function HeaderActions({
  authenticated,
  displayName,
  mobileOpen,
  onMenuToggle,
}: HeaderActionsProps) {
  const t = useTranslations()
  const { unreadCount } = useRealtimeChat()
  return (
    <nav
      aria-label={t("header.mainActionsAria")}
      className="ms-auto flex shrink-0 items-center gap-1.5 lg:gap-2"
    >
      {authenticated && (
        <>
          <OffersLink />
          <MessagesLink />
          <NotificationBell onOpen={mobileOpen ? onMenuToggle : undefined} />
        </>
      )}
      <span
        aria-hidden="true"
        className="mx-1 hidden h-6 w-px bg-primary/10 lg:block"
      />
      {authenticated ? (
        <div className="hidden lg:block">
          <UserDropdown displayName={displayName} />
        </div>
      ) : (
        <Link
          href="/login"
          className="hidden h-11 items-center gap-2 rounded-full px-3 pt-0.5 text-sm font-semibold text-primary/75 transition hover:bg-white hover:text-primary lg:flex"
        >
          <UserIcon className="size-4" />
          {t("header.login")}
        </Link>
      )}
      <Link
        href={authenticated ? "/listings/new" : "/register"}
        className="ms-1 flex h-10 shrink-0 items-center gap-2 rounded-full bg-accent px-4 pt-0.5 text-xs font-bold text-white shadow-sm shadow-accent/15 transition hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:h-11 lg:px-5 lg:text-sm"
      >
        <UploadIcon className="hidden size-4 sm:block" />
        {t("header.sell")}
      </Link>
      <button
        id="header-mobile-toggle"
        type="button"
        aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
        aria-expanded={mobileOpen}
        aria-controls="header-mobile-menu"
        onClick={onMenuToggle}
        className={`${headerActionClassName} lg:hidden`}
      >
        {authenticated && <CountBadge count={unreadCount} />}
        {mobileOpen ? (
          <CloseIcon className="size-5" />
        ) : (
          <MenuIcon className="size-5" />
        )}
      </button>
    </nav>
  )
}
