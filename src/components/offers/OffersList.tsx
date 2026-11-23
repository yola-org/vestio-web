"use client"

import { useEffect, useRef } from "react"
import { useRealtimeNotifications } from "@/components/shared/RealtimeProvider"
import LocalTime from "@/components/shared/LocalTime"
import ParticipantListingCover from "@/components/shared/ParticipantListingCover"
import OffersSkeleton from "@/components/offers/OffersSkeleton"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
import ReceivedOfferActions from "@/components/offers/ReceivedOfferActions"
import SentOfferActions from "@/components/offers/SentOfferActions"
import { useApiQuery } from "@/hooks/use-api-query"
import { getOffersAction } from "@/lib/actions/offers"

export default function OffersList({
  direction,
}: {
  direction: "sent" | "received"
}) {
  const t = useTranslations()
  const format = useFormatter()
  const { data, loading, error, refetch } = useApiQuery(
    () => getOffersAction(direction),
    { deps: [direction], loading: false },
  )

  const { notifications, unreadOffers, saving, markOffersRead } =
    useRealtimeNotifications()
  const readAttempts = useRef(new Set<string>())
  useEffect(() => {
    if (direction !== "received" || loading || error || !data || saving) return
    const readVisible = () => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return
      const visible = new Set(data.map((item) => item.offer.id))
      const unread = unreadOffers.filter(
        (item) =>
          typeof item.payload.offerId === "string" &&
          visible.has(item.payload.offerId) &&
          !readAttempts.current.has(item.id),
      )
      if (!unread.length) return
      for (const item of unread) readAttempts.current.add(item.id)
      void markOffersRead(unread.map((item) => item.payload.offerId as string))
    }
    readVisible()
    window.addEventListener("focus", readVisible)
    document.addEventListener("visibilitychange", readVisible)
    return () => {
      window.removeEventListener("focus", readVisible)
      document.removeEventListener("visibilitychange", readVisible)
    }
  }, [direction, loading, error, data, unreadOffers, saving, markOffersRead])
  const relevantType =
    direction === "received" ? "offer-sent" : "offer-accepted"
  const offerNotifications = notifications
    .filter((notification) => notification.type === relevantType)
    .map((notification) => notification.id)
    .join(",")
  useEffect(() => {
    if (offerNotifications) void refetch()
  }, [direction, offerNotifications, refetch])

  if (loading) return <OffersSkeleton sent={direction === "sent"} />

  if (error) {
    return (
      <div
        className="rounded-2xl border border-black/10 bg-white p-6"
        role="status"
      >
        <p>{t("offers.loadError")}</p>
        {error.status === 401 ? (
          <Link
            href="/login"
            className="mt-3 inline-block font-bold text-deep-accent"
          >
            {t("header.login")}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 font-bold text-deep-accent hover:underline"
          >
            {t("errors.retry")}
          </button>
        )}
      </div>
    )
  }

  if (!data?.length) {
    return (
      <p className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center text-primary/70">
        {t(direction === "sent" ? "offers.emptySent" : "offers.emptyReceived")}
      </p>
    )
  }

  return (
    <ul className="grid gap-4">
      {data.map(
        ({
          offer,
          listingTitle,
          listingStatus,
          listingDeliveryTypes,
          listingCoverAssetKey,
          senderName,
          senderProfileImageKey,
        }) => {
          const canViewListing =
            listingStatus === "AVAILABLE" || listingStatus === "SOLD"
          const delivery = offer.deliveryTypes.map((type) =>
            t(`sell.contactTypes.${type}`),
          )

          return (
            <li
              key={offer.id}
              className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <ParticipantListingCover
                    name={senderName}
                    profileImageKey={senderProfileImageKey}
                    listingId={offer.listingId}
                    listingTitle={listingTitle}
                    listingCoverAssetKey={listingCoverAssetKey}
                  />
                  <div className="min-w-0">
                    {senderName && (
                      <p className="break-words text-sm font-semibold">
                        {senderName}
                      </p>
                    )}
                    <h2 className="text-lg font-bold break-words">
                      {canViewListing ? (
                        <Link
                          href={`/listings/${offer.listingId}`}
                          className="hover:underline"
                        >
                          {listingTitle}
                        </Link>
                      ) : (
                        listingTitle
                      )}
                    </h2>
                    <LocalTime
                      dateTime={offer.createdAt}
                      className="text-sm text-primary/65"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
                    {t(`offers.status.${offer.status}`)}
                  </span>
                  <strong>
                    {format.number(offer.price)} {t("common.currency")}
                  </strong>
                </div>
              </div>
              {delivery.length > 0 && (
                <p className="mt-3 text-sm">
                  {format.list(delivery, { type: "unit" })}
                </p>
              )}
              {offer.message.trim() && (
                <p className="mt-2 whitespace-pre-wrap break-words text-primary/75">
                  {offer.message}
                </p>
              )}
              {direction === "received" && offer.status === "PENDING" && (
                <ReceivedOfferActions
                  listingId={offer.listingId}
                  listingTitle={listingTitle}
                  offerId={offer.id}
                  onChanged={() => void refetch()}
                />
              )}
              {direction === "sent" && offer.status === "PENDING" && (
                <SentOfferActions
                  listingId={offer.listingId}
                  listingTitle={listingTitle}
                  offerId={offer.id}
                  deliveryTypes={[
                    ...new Set(listingDeliveryTypes ?? offer.deliveryTypes),
                  ]}
                  initial={{
                    price: String(offer.price),
                    deliveryTypes: offer.deliveryTypes,
                    message: offer.message,
                  }}
                  onChanged={() => void refetch()}
                />
              )}
            </li>
          )
        },
      )}
    </ul>
  )
}
