
'use server';

import { z } from 'zod';

import { runAction, type ApiResult } from '@/lib/api/action-result.ts';
import { request } from '@/lib/api/request.ts';
import type { Listing, ListingInput, PaginatedResponse } from '@/lib/api/schemas';
import { ListingInputSchema } from '@/lib/api/schemas';
import { parseInput } from '@/lib/api/validation';

/** Partial listing payload returned by the backend before normalization. */
const ListingResponseSchema = z.object({
  category: z.object({ id: z.string() }).nullish(),
  cities: z.array(z.object({ id: z.string() })).nullish(),
  sizes: z.array(z.object({ id: z.string() })).nullish(),
  categoryId: z.string().nullish(),
  cityIds: z.array(z.string()).optional(),
  sizeIds: z.array(z.string()).optional(),
});

type ListingResponse = z.infer<typeof ListingResponseSchema>;

function normalizeListing(data: ListingResponse): Listing {
  return {
    ...data,
    categoryId: data.category?.id ?? data.categoryId,
    cityIds: Array.isArray(data.cities)
        ? data.cities.map(city => city.id)
        : data.cityIds ?? [],
    sizeIds: Array.isArray(data.sizes)
        ? data.sizes.map(size => size.id)
        : data.sizeIds ?? [],
  } as Listing;
}

function normalizeListingsResponse(
    response: PaginatedResponse<ListingResponse>
): PaginatedResponse<Listing> {
  return {
    ...response,
    content: Array.isArray(response?.content)
        ? response.content.map(normalizeListing)
        : [],
  };
}

function toListingPayload(listing: ListingInput) {
  return {
    ...listing,
    cities: (listing.cityIds ?? []).map(id => ({ id })),
    category: listing.categoryId ? { id: listing.categoryId } : null,
    sizes: (listing.sizeIds ?? []).map(id => ({ id })),
  };
}

export async function getListingsAction(
    page = 0,
    size = 12
): Promise<ApiResult<PaginatedResponse<Listing>>> {
  return runAction(async () => {
    const response = await request<PaginatedResponse<ListingResponse>>(
        `/api/listings?page=${page}&size=${size}`
    );

    return normalizeListingsResponse(response);
  });
}

export async function getListingAction(
    id: string
): Promise<ApiResult<Listing>> {
  return runAction(async () => {
    const response = await request<ListingResponse>(
        `/api/listings/${encodeURIComponent(id)}`
    );

    return normalizeListing(response);
  });
}

export async function createListingAction(
    listing: ListingInput
): Promise<ApiResult<Listing>> {
  return runAction(() => {
    const input = parseInput(ListingInputSchema, listing);
    return request<Listing>('/api/listings', {
        method: 'POST',
        body: JSON.stringify(toListingPayload(input)),
      });
  });
}

export async function updateListingAction(
    id: string,
    listing: ListingInput
): Promise<ApiResult<Listing>> {
  return runAction(() => {
    const input = parseInput(ListingInputSchema, listing);
    return request<Listing>(`/api/listings/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(toListingPayload(input)),
      });
  });
}

export async function deleteListingAction(
    id: string
): Promise<ApiResult<null>> {
  return runAction(async () => {
    await request<void>(`/api/listings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    return null;
  });
}
