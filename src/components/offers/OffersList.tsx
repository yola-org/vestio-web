"use client"

import Spinner from "@/components/shared/Spinner"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"
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

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-deep-accent">
        <Spinner className="size-8 border-4" label={t("common.loading")} />
      </div>
    )
  }

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
        ({ offer, listingTitle, listingStatus, listingDeliveryTypes }) => {
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
                <div>
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
                  <time
                    dateTime={offer.createdAt}
                    className="text-sm text-primary/65"
                  >
                    {format.dateTime(new Date(offer.createdAt), {
                      dateStyle: "medium",
                    })}
                  </time>
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
