"use client"

import { useRef, useState } from "react"
import { useTranslations } from "next-intl"
import Button from "@/components/shared/Button"
import { acceptOfferAction, refuseOfferAction } from "@/lib/actions/offers"

export default function ReceivedOfferActions({
  listingId,
  listingTitle,
  offerId,
  onChanged,
}: {
  listingId: string
  listingTitle: string
  offerId: string
  onChanged: () => void
}) {
  const t = useTranslations("offers")
  const inFlight = useRef(false)
  const [pending, setPending] = useState<"accept" | "refuse" | null>(null)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState<string>()

  async function respond(action: "accept" | "refuse") {
    if (inFlight.current || finished) return
    inFlight.current = true
    setPending(action)
    setError(undefined)
    try {
      const result = await (
        action === "accept" ? acceptOfferAction : refuseOfferAction
      )(listingId, offerId)
      if (result.success) {
        setFinished(true)
        onChanged()
      } else if (result.error.error === "ERR_OFFER_NOT_PENDING") {
        setFinished(true)
        setError(t("decisionNotPending"))
        onChanged()
      } else {
        setError(t(action === "accept" ? "acceptFailed" : "refuseFailed"))
      }
    } catch {
      setError(t(action === "accept" ? "acceptFailed" : "refuseFailed"))
    } finally {
      inFlight.current = false
      setPending(null)
    }
  }

  return (
    <div className="mt-4 border-t border-black/10 pt-4">
      {!finished && (
        <div
          role="group"
          aria-label={t("actionsFor", { title: listingTitle })}
          className="flex flex-wrap gap-2"
        >
          <Button
            onClick={() => void respond("accept")}
            loading={pending === "accept"}
            disabled={pending !== null}
            className="rounded-full bg-deep-accent px-4 py-2 text-sm font-bold text-white enabled:hover:opacity-90 disabled:opacity-60"
          >
            {t("accept")}
          </Button>
          <Button
            onClick={() => void respond("refuse")}
            loading={pending === "refuse"}
            disabled={pending !== null}
            className="rounded-full border border-red-700 px-4 py-2 text-sm font-bold text-red-700 enabled:hover:bg-red-50 disabled:opacity-60"
          >
            {t("refuse")}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
