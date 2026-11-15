"use server"

import { z } from "zod"
import { runAction } from "@/lib/api/action-result"
import { request } from "@/lib/api/request"
import { ContactTypeSchema, ListingStatusSchema } from "@/lib/api/schemas"

const OfferSummarySchema = z.object({
  offer: z.object({
    id: z.uuid(),
    listingId: z.uuid(),
    price: z.number(),
    deliveryTypes: z.array(ContactTypeSchema),
    message: z.string(),
    status: z.enum(["PENDING", "ACCEPTED"]),
    createdAt: z.string(),
  }),
  listingTitle: z.string(),
  listingStatus: ListingStatusSchema,
  listingDeliveryTypes: z.array(ContactTypeSchema).nullish(),
})

export async function getOffersAction(direction: "sent" | "received") {
  return runAction(async () => {
    const type = z.enum(["sent", "received"]).parse(direction)
    return z
      .array(OfferSummarySchema)
      .parse(await request<unknown>(`/api/offers/${type}`))
  })
}
