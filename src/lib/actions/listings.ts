'use server';

import { runAction, ActionResult } from '@/lib/api/action-result.ts';
import { request } from '@/lib/api/request.ts';
import { Listing, ListingInput, PaginatedResponse } from '@/types/api.ts';

export async function getListingsAction(page = 0, size = 12): Promise<ActionResult<PaginatedResponse<Listing>>> {
  return runAction(() => request<PaginatedResponse<Listing>>(`/api/listings?page=${page}&size=${size}`));
}

export async function getListingAction(id: string): Promise<ActionResult<Listing>> {
  return runAction(() => request<Listing>(`/api/listings/${encodeURIComponent(id)}`));
}

export async function createListingAction(listing: ListingInput): Promise<ActionResult<Listing>> {
  return runAction(() =>
    request<Listing>('/api/listings', { method: 'POST', body: JSON.stringify(listing) })
  );
}

export async function updateListingAction(
  id: string,
  listing: ListingInput
): Promise<ActionResult<Listing>> {
  return runAction(() =>
    request<Listing>(`/api/listings/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(listing),
    })
  );
}

export async function deleteListingAction(id: string): Promise<ActionResult<null>> {
  return runAction(async () => {
    await request<void>(`/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return null;
  });
}