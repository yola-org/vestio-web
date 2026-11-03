'use server';

import { runAction, ActionResult } from '@/lib/api/action-result.ts';
import { request } from '@/lib/api/request.ts';
import { Listing, ListingInput, PaginatedResponse } from '@/types/api.ts';

export async function getListingsAction(page = 0, size = 12): Promise<ActionResult<PaginatedResponse<Listing>>> {
  return runAction(async () => {
    const response = await request<PaginatedResponse<any>>(`/api/listings?page=${page}&size=${size}`);
    return {
      ...response,
      content: response.content.map(data => ({
        ...data,
        categoryId: data.category?.id || data.categoryId,
        cityIds: data.cities?.map((c: any) => c.id) || data.cityIds || [],
        sizeIds: data.sizes?.map((s: any) => s.id) || data.sizeIds || [],
      }))
    };
  });
}

export async function getListingAction(id: string): Promise<ActionResult<Listing>> {
  return runAction(async () => {
    const data = await request<any>(`/api/listings/${encodeURIComponent(id)}`);
    // Normalize nested objects to flat IDs for the frontend
    return {
      ...data,
      categoryId: data.category?.id || data.categoryId,
      cityIds: data.cities?.map((c: any) => c.id) || data.cityIds || [],
      sizeIds: data.sizes?.map((s: any) => s.id) || data.sizeIds || [],
    };
  });
}

export async function createListingAction(listing: ListingInput): Promise<ActionResult<Listing>> {
  const payload = {
    ...listing,
    cities: (listing.cityIds || []).map(id => ({ id })),
    category: listing.categoryId ? { id: listing.categoryId } : null,
    sizes: (listing.sizeIds || []).map(id => ({ id })),
  };

  return runAction(() =>
    request<Listing>('/api/listings', { method: 'POST', body: JSON.stringify(payload) })
  );
}

export async function updateListingAction(
  id: string,
  listing: ListingInput
): Promise<ActionResult<Listing>> {
  const payload = {
    ...listing,
    cities: (listing.cityIds || []).map(id => ({ id })),
    category: listing.categoryId ? { id: listing.categoryId } : null,
    sizes: (listing.sizeIds || []).map(id => ({ id })),
  };

  return runAction(() =>
    request<Listing>(`/api/listings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  );
}

export async function deleteListingAction(id: string): Promise<ActionResult<null>> {
  return runAction(async () => {
    await request<void>(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return null;
  });
}