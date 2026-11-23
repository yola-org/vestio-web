"use server"

/** Partial listing payload returned by the backend before normalization. */

import { z } from "zod"

import { runAction, type ApiResult } from "@/lib/api/action-result.ts"
import { request } from "@/lib/api/request.ts"
import type {
  Listing,
  ListingInput,
  PaginatedResponse,
} from "@/lib/api/schemas"
import { ContactTypeSchema, ListingInputSchema } from "@/lib/api/schemas"
import { parseInput } from "@/lib/api/validation"

const ListingResponseSchema = z.object({
  category: z.object({ id: z.string() }).nullish(),
  cities: z
    .array(z.object({ id: z.string(), name: z.string().nullish() }))
    .nullish(),
  sizes: z.array(z.object({ id: z.string() })).nullish(),
  categoryId: z.string().nullish(),
  cityIds: z.array(z.string()).optional(),
  cityNames: z.array(z.string()).nullish(),
  sizeIds: z.array(z.string()).optional(),
  sizeNames: z.array(z.string()).nullish(),
})

type ListingResponse = z.infer<typeof ListingResponseSchema>

function normalizeListing(data: ListingResponse): Listing {
  return {
    ...data,
    categoryId: data.category?.id ?? data.categoryId,
    cityIds: data.cities?.map((city) => city.id) ?? data.cityIds ?? [],
    cityNames: data.cityNames?.filter(Boolean) as string[] | undefined,
    sizeIds: Array.isArray(data.sizes)
      ? data.sizes.map((size) => size.id)
      : (data.sizeIds ?? []),
  } as Listing
}

export async function getListingsAction(
  page = 0,
  size = 12,
): Promise<ApiResult<PaginatedResponse<Listing>>> {
  return runAction(async () => {
    const response =
      await request<ListingResponse[] | PaginatedResponse<ListingResponse>>(
        `/api/listings?page=${page}&size=${size}`,
        {},
        false,
      )

    if (Array.isArray(response)) {
      const content = response.slice(page * size, (page + 1) * size)
      return {
        content: content.map(normalizeListing),
        totalElements: response.length,
        totalPages: Math.ceil(response.length / size),
        number: page,
        size,
      }
    }

    const content = Array.isArray(response?.content) ? response.content : []
    return {
      ...response,
      content: content.map(normalizeListing),
    }
  })
}

export async function searchListingsAction(
  filters: Record<string, string>,
  page: number,
  size: number,
): Promise<ApiResult<Listing[]>> {
  return runAction(async () => {
    const params = new URLSearchParams({
      ...filters,
      page: String(page),
      size: String(size),
    })
    const listings = await request<ListingResponse[]>(
      `/api/listings/search?${params}`,
      {},
      false,
    )
    return listings.map(normalizeListing)
  })
}

export async function getListingAction(
  id: string,
): Promise<ApiResult<Listing>> {
  return runAction(async () => {
    const response = await request<ListingResponse>(
      `/api/listings/${encodeURIComponent(id)}`,
      {},
      false,
    )
    return normalizeListing(response)
  })
}

export async function getFavoritesAction(): Promise<ApiResult<Listing[]>> {
  return runAction(async () => {
    const listings = await request<ListingResponse[]>("/api/listings/favorites")
    return listings.map(normalizeListing)
  })
}

export async function getPendingListingsAction(
  page: number,
  size: number,
): Promise<ApiResult<Listing[]>> {
  return runAction(async () => {
    const listings = await request<ListingResponse[]>(
      `/api/listings/pending?page=${page}&size=${size}`,
    )
    return listings.map(normalizeListing)
  })
}

const FavoriteInputSchema = z.object({ id: z.uuid(), saved: z.boolean() })

export async function setFavoriteAction(
  id: string,
  saved: boolean,
): Promise<ApiResult<null>> {
  return runAction(async () => {
    const input = parseInput(FavoriteInputSchema, { id, saved })
    await request<void>(`/api/listings/${input.id}/favorite`, {
      method: input.saved ? "POST" : "DELETE",
    })
    return null
  })
}

export async function createListingAction(
  listing: ListingInput,
): Promise<ApiResult<Listing>> {
  return runAction(() => {
    const input = parseInput(ListingInputSchema, listing)
    return request<Listing>("/api/listings", {
      method: "POST",
      body: JSON.stringify(input),
    })
  })
}

export async function updateListingAction(
  id: string,
  listing: ListingInput,
): Promise<ApiResult<Listing>> {
  return runAction(() => {
    const input = parseInput(ListingInputSchema, listing)
    return request<Listing>(`/api/listings/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })
  })
}

export async function deleteListingAction(
  id: string,
): Promise<ApiResult<null>> {
  return runAction(async () => {
    await request<void>(`/api/listings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    })

    return null
  })
}

const OfferInputSchema = z.object({
  listingId: z.uuid(),
  price: z.string().regex(/^(?!0+(?:\.0{1,2})?$)[0-9]{1,17}(?:\.[0-9]{1,2})?$/),
  deliveryTypes: z.array(ContactTypeSchema).min(1),
  message: z.string(),
})

export type OfferDetailsInput = Omit<z.input<typeof OfferInputSchema>, "listingId">

export async function createOfferAction(
  input: z.input<typeof OfferInputSchema>,
): Promise<ApiResult<null>> {
  return runAction(async () => {
    const { listingId, ...offer } = parseInput(OfferInputSchema, input)
    await request(`/api/listings/${listingId}/offers`, {
      method: "POST",
      body: JSON.stringify(offer),
    })
    return null
  })
}

export async function updateOfferAction(
  listingId: string,
  offerId: string,
  details: OfferDetailsInput,
): Promise<ApiResult<null>> {
  return runAction(async () => {
    const { listingId: id, ...offer } = parseInput(OfferInputSchema, {
      listingId,
      ...details,
    })
    const offerKey = parseInput(z.uuid(), offerId)
    await request(`/api/listings/${id}/offers/${offerKey}`, {
      method: "PUT",
      body: JSON.stringify(offer),
    })
    return null
  })
}

export async function cancelOfferAction(
  listingId: string,
  offerId: string,
): Promise<ApiResult<null>> {
  return runAction(async () => {
    const id = parseInput(z.uuid(), listingId)
    const offerKey = parseInput(z.uuid(), offerId)
    await request(`/api/listings/${id}/offers/${offerKey}`, {
      method: "DELETE",
    })
    return null
  })
}
