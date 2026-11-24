"use server"

import { z } from "zod"
import { runAction } from "@/lib/api/action-result"
import { parseInput } from "@/lib/api/validation"
import { request } from "@/lib/api/request"
import {
  ContactTypeSchema,
  ListingStatusSchema,
  paginatedResponseSchema,
} from "@/lib/api/schemas"

const OfferSummarySchema = z.object({
  offer: z.object({
    id: z.uuid(),
    listingId: z.uuid(),
    price: z.number(),
    deliveryTypes: z.array(ContactTypeSchema),
    message: z.string(),
    status: z.enum(["PENDING", "ACCEPTED", "REFUSED"]),
    createdAt: z.iso.datetime({ offset: true }),
  }),
  listingTitle: z.string(),
  listingCoverAssetKey: z.uuid().nullish(),
  senderName: z.string().optional(),
  senderProfileImageKey: z.string().nullish(),
  listingStatus: ListingStatusSchema,
  listingDeliveryTypes: z.array(ContactTypeSchema).nullish(),
})

export async function getOffersAction(
  direction: "sent" | "received",
  page = 0,
  size = 12,
) {
  return runAction(async () => {
    const type = z.enum(["sent", "received"]).parse(direction)
    return paginatedResponseSchema(OfferSummarySchema).parse(
      await request<unknown>(`/api/offers/${type}?page=${page}&size=${size}`),
    )
  })
}

export async function acceptOfferAction(listingId: string, offerId: string) {
  return runAction(async () => {
    const id = parseInput(z.uuid(), listingId)
    const offerKey = parseInput(z.uuid(), offerId)
    await request(`/api/listings/${id}/offers/${offerKey}/accept`, {
      method: "PUT",
    })
    return null
  })
}

export async function refuseOfferAction(listingId: string, offerId: string) {
  return runAction(async () => {
    const id = parseInput(z.uuid(), listingId)
    const offerKey = parseInput(z.uuid(), offerId)
    await request(`/api/listings/${id}/offers/${offerKey}/refuse`, {
      method: "PUT",
    })
    return null
  })
}
