"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import {
  EmailLegacyIcon,
  EmailShareButton,
  FacebookLegacyIcon,
  FacebookShareButton,
  WhatsappLegacyIcon,
  WhatsappShareButton,
} from "react-share"

export default function ListingShare({ title }: { title: string }) {
  const t = useTranslations()
  const [url, setUrl] = useState("")
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setUrl(window.location.href)
    setCanNativeShare(typeof navigator.share === "function")
  }, [])

  if (!url) return null

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/10 pt-4">
      <WhatsappShareButton
        url={url}
        message={title}
        separator=" - "
        aria-label={t("listingDetail.shareWhatsapp")}
      >
        <WhatsappLegacyIcon size={36} round />
      </WhatsappShareButton>

      <FacebookShareButton
        url={url}
        aria-label={t("listingDetail.shareFacebook")}
      >
        <FacebookLegacyIcon size={36} round />
      </FacebookShareButton>

      <EmailShareButton
        url={url}
        subject={title}
        body={title}
        separator="\n"
        aria-label={t("listingDetail.shareEmail")}
      >
        <EmailLegacyIcon size={36} round />
      </EmailShareButton>

      {canNativeShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
          className="rounded-full border border-black/10 px-3 py-1.5 text-sm font-bold hover:bg-black/5"
        >
          {t("listingDetail.shareMore")}
        </button>
      )}
    </div>
  )
}
