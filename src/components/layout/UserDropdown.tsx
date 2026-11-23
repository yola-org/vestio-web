"use client"

import { useState, useRef, useEffect, useId } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  UserIcon,
  ClockIcon,
  HeartIcon,
  LogOutIcon,
  HelpIcon,
  ContactIcon,
  SettingsIcon,
  ChevronIcon,
} from "@/components/shared/Icons"
import { getProfileImageUrl } from "@/lib/profile-images"
import ProfileAvatar from "@/components/shared/ProfileAvatar"
import PreferencesModal from "@/components/profile/PreferencesModal"
import { authApi } from "@/lib/api"
import type { AccountDisplayName } from "@/lib/api/schemas"
import { useApiAction } from "@/hooks/use-api-action"
import { clearAuthTracking, notifyAuthChanged } from "@/lib/auth"
import { useTranslations } from "next-intl"
import { headerActionClassName } from "./header-styles"

export default function UserDropdown({
  displayName,
  inline = false,
}: {
  displayName?: AccountDisplayName
  inline?: boolean
}) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const router = useRouter()
  const logout = useApiAction(authApi.logout, {
    onSuccess: () => {
      clearAuthTracking()
      notifyAuthChanged()
      router.push("/login")
    },
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", escape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", escape)
    }
  }, [isOpen])

  const handleLogout = async () => {
    await logout.execute()
    setIsOpen(false)
    router.push("/login")
  }

  const menuItems = [
    { label: t("userMenu.profile"), href: "/profile", icon: UserIcon },
    { label: t("header.favorites"), href: "/favorites", icon: HeartIcon },
    {
      label: t("pendingListings.title"),
      href: "/listings/pending",
      icon: ClockIcon,
    },
    {
      label: t("userMenu.preferences"),
      onClick: () => setIsPreferencesOpen(true),
      icon: SettingsIcon,
    },
    { label: t("userMenu.help"), href: "/faq", icon: HelpIcon },
    { label: t("userMenu.contact"), href: "/contact", icon: ContactIcon },
  ]

  return (
    <div className={`relative ${inline ? "w-full" : ""}`} ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          inline
            ? "flex w-full items-center gap-3 rounded-2xl bg-background/50 p-3 text-start focus-visible:outline-2 focus-visible:outline-accent"
            : `${headerActionClassName} gap-1.5 lg:w-auto lg:px-1.5`
        }
        aria-label={t("userMenu.account")}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        title={t("userMenu.account")}
      >
        <ProfileAvatar
          src={getProfileImageUrl(displayName?.profileImageKey)}
          firstName={displayName?.firstName ?? undefined}
          lastName={displayName?.lastName ?? undefined}
          size="sm"
        />
        {inline && (
          <span className="flex-1 text-sm font-semibold">
            {t("userMenu.account")}
          </span>
        )}
        <ChevronIcon
          className={`h-4 w-4 text-black/40 transition ${
            inline ? "" : "hidden lg:block"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className={
            inline
              ? "mt-3 overflow-hidden rounded-2xl border border-primary/10 bg-white"
              : "absolute end-0 mt-3 w-64 max-h-[60dvh] overflow-y-auto rounded-3xl border border-primary/10 bg-white shadow-xl z-50"
          }
        >
          <div className="border-b border-primary/5 p-4 bg-background/50">
            <p className="text-xs font-bold uppercase tracking-wider text-black/40">
              {t("userMenu.account")}
            </p>
            {(displayName?.firstName || displayName?.lastName) && (
              <p className="mt-1 text-sm font-bold truncate">
                {displayName.firstName} {displayName.lastName}
              </p>
            )}
          </div>

          <div className="py-2">
            {menuItems.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-background hover:text-deep-accent"
                >
                  <item.icon className="h-5 w-5 opacity-70" />
                  <span className="translate-y-px">{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick?.()
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-background hover:text-deep-accent"
                >
                  <item.icon className="h-5 w-5 opacity-70" />
                  <span className="translate-y-px">{item.label}</span>
                </button>
              ),
            )}
          </div>

          <div className="border-t border-black/5 py-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-start text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOutIcon className="h-5 w-5 opacity-70" />
              <span className="translate-y-px">{t("userMenu.logout")}</span>
            </button>
          </div>
        </div>
      )}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  )
}
