"use client"

/** Resolves saved and live notifications through the same presentation rules. */

import type { ReactNode } from "react"
import type { ActionTarget } from "@/components/shared/NotificationAction"
import { z } from "zod"
import { useFormatter, useTranslations } from "next-intl"
import {
  OfferAcceptedPayloadSchema,
  OfferSentPayloadSchema,
  type Notification,
} from "@/lib/realtime-events"

export interface ResolvedNotification {
  content: ReactNode
  action?: ActionTarget & { label: string }
}
export function useNotificationResolver() {
  const t = useTranslations("notifications")
  const common = useTranslations("common")
  const format = useFormatter()

  return (item: Notification): ResolvedNotification => {
    const isPending = item.type === "listing-created"
    const isReady = item.type === "listing-published"
    const listingId = z.uuid().safeParse(item.listingId).data
    const offerResult =
      item.type === "offer-sent"
        ? OfferSentPayloadSchema.safeParse(item.payload)
        : undefined
    const offer = offerResult?.success ? offerResult.data : undefined
    const acceptedResult =
      item.type === "offer-accepted"
        ? OfferAcceptedPayloadSchema.safeParse(item.payload)
        : undefined
    const acceptedOffer = acceptedResult?.success
      ? acceptedResult.data
      : undefined
    let text = t("newActivity")
    let target: ActionTarget | undefined
    let linkLabel: "viewChat" | "viewOffer" | "viewReadyListing" | "viewListing" =
      "viewOffer"
    if (acceptedOffer) {
      text = t("offerAccepted", {
        amount: format.number(acceptedOffer.amount, {
          style: "currency",
          currency: acceptedOffer.currency,
          currencyDisplay: "code",
        }),
        owner: acceptedOffer.ownerName.trim() || t("unknownSender"),
        title: acceptedOffer.listingTitle,
      })
      target = { panel: { type: "chat", chatId: acceptedOffer.chatId } }
      linkLabel = "viewChat"
    } else if (offer) {
      text = t("offerReceived", {
        amount: format.number(offer.amount, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        currency: common("currency"),
        sender: offer.senderName.trim() || t("unknownSender"),
        title: offer.listingTitle,
      })
      target = { panel: { type: "offers", direction: "received" } }
    } else if (isPending || isReady) {
      text = t(isReady ? "listingReady" : "listingPending", {
        title:
          typeof item.payload.listingTitle === "string"
            ? item.payload.listingTitle
            : "",
      })
      if (isPending || listingId) {
        target = {
          href: isReady ? `/listings/${listingId}` : "/listings/pending",
        }
        linkLabel = isReady ? "viewReadyListing" : "viewListing"
      }
    }
    return {
      content: <span>{text}</span>,
      action: target ? { ...target, label: t(linkLabel) } : undefined,
    }
  }
}
