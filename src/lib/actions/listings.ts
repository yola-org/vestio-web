"use server"

/** Partial listing payload returned by the backend before normalization. */

import { z } from "zod"

import { getCitiesAction } from "@/lib/actions/profile"
import { runAction, type ApiResult } from "@/lib/api/action-result.ts"
import { request } from "@/lib/api/request.ts"
import type {
  Listing,
  ListingInput,
  PaginatedResponse,
} from "@/lib/api/schemas"
import { ListingInputSchema } from "@/lib/api/schemas"
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
})

type ListingResponse = z.infer<typeof ListingResponseSchema>

function normalizeListing(
  data: ListingResponse,
  cityNamesById: ReadonlyMap<string, string>,
): Listing {
  const cityIds = data.cities?.map((city) => city.id) ?? data.cityIds ?? []
  const nestedCityNames = new Map(
    data.cities?.map((city) => [city.id, city.name]),
  )

  return {
    ...data,
    categoryId: data.category?.id ?? data.categoryId,
    cityIds,
    cityNames: data.cityNames?.some(Boolean)
      ? data.cityNames.filter(Boolean)
      : cityIds
          .map((id) => nestedCityNames.get(id) || cityNamesById.get(id))
          .filter((name): name is string => Boolean(name)),
    sizeIds: Array.isArray(data.sizes)
      ? data.sizes.map((size) => size.id)
      : (data.sizeIds ?? []),
  } as Listing
}

async function getCityNamesById(listings: ListingResponse[]) {
  const needsCityNames = listings.some(
    (listing) =>
      !listing.cityNames?.some(Boolean) &&
      (listing.cities
        ? listing.cities.some((city) => !city.name)
        : Boolean(listing.cityIds?.length)),
  )
  if (!needsCityNames) return new Map<string, string>()

  const cities = await getCitiesAction()
  return new Map(
    cities.success ? cities.data.map(({ id, name }) => [id, name]) : [],
  )
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
      const cityNamesById = await getCityNamesById(content)
      return {
        content: content.map((listing) =>
          normalizeListing(listing, cityNamesById),
        ),
        totalElements: response.length,
        totalPages: Math.ceil(response.length / size),
        number: page,
        size,
      }
    }

    const content = Array.isArray(response?.content) ? response.content : []
    const cityNamesById = await getCityNamesById(content)
    return {
      ...response,
      content: content.map((listing) =>
        normalizeListing(listing, cityNamesById),
      ),
    }
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

    return normalizeListing(response, await getCityNamesById([response]))
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
