import {
  createListingAction,
  deleteListingAction,
  getListingAction,
  getListingsAction,
  updateListingAction,
} from '@/lib/actions/listings';
import { loginAction, logoutAction, signupAction } from '@/lib/actions/auth';
import {
  getCategoriesAction,
  getCategoryGroupsAction,
  getCitiesAction,
  getSizesAction,
  getConditionsAction,
  getContactTypesAction,
  getOnboardingStatusAction,
  getPreferencesAction,
  getProfileAction,
  getStaticDataAction,
  updatePreferencesAction,
  updateProfileAction,
} from '@/lib/actions/profile';
import type { ActionResult } from '@/lib/api/action-result';
import { Category, City, Listing, ListingInput, LoginRequest, SignupRequest, UserPreferences, UserProfile } from '@/types/api';

/**
 * Unwraps a server action result, throwing an error if the action failed.
 */
async function unwrap<T>(result: Promise<ActionResult<T>>): Promise<T> {
  const response = await result;
  if (!response.success) {
    const error = new Error(response.error) as Error & { code?: string; status?: number };
    error.code = response.code;
    error.status = response.status;
    throw error;
  }
  return response.data as T;
}

/**
 * Authentication API
 */
export const authApi = {
  login: (credentials: LoginRequest) => unwrap(loginAction(credentials)),
  signup: (credentials: SignupRequest) => unwrap(signupAction(credentials)),
  logout: () => unwrap(logoutAction()),
};

/**
 * Listings API
 */
export const listingsApi = {
  list: (page = 0, size = 12) => unwrap(getListingsAction(page, size)),
  get: (id: string) => unwrap(getListingAction(id)),
  create: (listing: ListingInput) => unwrap(createListingAction(listing)),
  update: (id: string, listing: ListingInput) => unwrap(updateListingAction(id, listing)),
  delete: (id: string) => unwrap(deleteListingAction(id)),
};

/**
 * Profile and metadata API
 */
export const profileApi = {
  get: () => unwrap(getProfileAction()),
  update: (profile: Partial<UserProfile>) => unwrap(updateProfileAction(profile)),
  getOnboardingStatus: () => unwrap(getOnboardingStatusAction()),
  getPreferences: () => unwrap(getPreferencesAction()),
  updatePreferences: (preferences: UserPreferences) => unwrap(updatePreferencesAction(preferences)),
  getCategories: () => unwrap(getCategoriesAction()),
  getCategoryGroups: () => unwrap(getCategoryGroupsAction()),
  getCities: () => unwrap(getCitiesAction()),
  getSizes: () => unwrap(getSizesAction()),
  getConditions: () => unwrap(getConditionsAction()),
  getContactTypes: () => unwrap(getContactTypesAction()),
  getStaticData: () => unwrap(getStaticDataAction()),
};

export type { Listing };
export { callApi } from '@/lib/api/call';
export type { ApiErrorHandler, CallApiOptions, ApiResult } from '@/lib/api/call';