"use client"

import PanelButton from "@/components/shared/PanelButton"
import { useTranslations } from "next-intl"
import { OfferIcon } from "@/components/shared/Icons"
import { headerActionClassName } from "./header-styles"
import { useOffersPanel } from "@/components/offers/OffersPanelProvider"
import { useRealtimeNotifications } from "@/components/shared/RealtimeProvider"

interface OffersLinkProps {
  menu?: boolean
  onNavigate?: () => void
}

export default function OffersLink({
  menu = false,
  onNavigate,
}: OffersLinkProps) {
  const t = useTranslations("offers")
  const { panel } = useOffersPanel()
  const { unreadOffers } = useRealtimeNotifications()
  const count = unreadOffers.length
  return (
    <PanelButton
      panel={{ type: "offers" }}
      onClick={onNavigate}
      aria-label={count ? t("badge", { count }) : t("title")}
      data-offers-trigger
      aria-haspopup="dialog"
      aria-expanded={Boolean(panel)}
      aria-current={panel ? "page" : undefined}
      className={
        menu
          ? "flex items-center gap-3 rounded-2xl border border-primary/8 bg-background/50 px-4 py-4"
          : `${headerActionClassName} hidden w-auto gap-2 px-3.5 text-sm font-semibold lg:flex lg:w-auto`
      }
    >
      {menu && <OfferIcon className="size-5 shrink-0" />}
      <span className="inline-flex items-center gap-2" dir="ltr">
        {count > 0 && (
          <span
            aria-hidden="true"
            data-offers-badge
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold leading-none text-white"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
        <span dir="auto">{t("title")}</span>
      </span>
    </PanelButton>
  )
}
