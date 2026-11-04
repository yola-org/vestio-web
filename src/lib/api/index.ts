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
 * This is used to provide a consistent API interface where server actions
 * return promises that throw on error, similar to direct API calls.
 * 
 * @template T - Type of successful response data
 * @param result - Promise of ActionResult from a server action
 * @returns Promise resolving to the data on success
 * @throws {Error} With code and status attached if action fails
 * @internal
 */
async function unwrap<T>(result: Promise<ActionResult<T>>): Promise<T> {
  const response = await result;
  if (!response.success) {
    const error = new Error(response.error) as Error & { code?: string; status?: number };
    error.code = response.code;
    error.status = response.status;
    throw error;
  }
  return response.data;
}

/**
 * Authentication API - uses server actions wrapped with unwrap()
 * All methods throw errors on failure
 */
export const authApi = {
  /** Login with credentials */
  login: (credentials: LoginRequest) => unwrap(loginAction(credentials)),
  /** Sign up new user */
  signup: (credentials: SignupRequest) => unwrap(signupAction(credentials)),
  /** Logout current session */
  logout: () => unwrap(logoutAction()),
};

/**
 * Listings API - uses server actions wrapped with unwrap()
 * All methods throw errors on failure, use with callApi() in client components
 */
export const listingsApi = {
  /** Get paginated listings */
  list: (page = 0, size = 12) => unwrap(getListingsAction(page, size)),
  /** Get single listing by ID */
  get: (id: string) => unwrap(getListingAction(id)),
  /** Create new listing */
  create: (listing: ListingInput) => unwrap(createListingAction(listing)),
  /** Update existing listing */
  update: (id: string, listing: ListingInput) => unwrap(updateListingAction(id, listing)),
  /** Delete listing */
  delete: (id: string) => unwrap(deleteListingAction(id)),
};

/**
 * Profile and metadata API - uses server actions wrapped with unwrap()
 * All methods throw errors on failure, use with callApi() in client components
 */
export const profileApi = {
  /** Get current user profile */
  get: () => unwrap(getProfileAction()),
  /** Update user profile */
  update: (profile: Partial<UserProfile>) => unwrap(updateProfileAction(profile)),
  /** Get onboarding status */
  getOnboardingStatus: () => unwrap(getOnboardingStatusAction()),
  /** Get user preferences */
  getPreferences: () => unwrap(getPreferencesAction()),
  /** Update user preferences */
  updatePreferences: (preferences: UserPreferences) => unwrap(updatePreferencesAction(preferences)),
  /** Get all categories */
  getCategories: () => unwrap(getCategoriesAction()),
  /** Get category groups */
  getCategoryGroups: () => unwrap(getCategoryGroupsAction()),
  /** Get all cities */
  getCities: () => unwrap(getCitiesAction()),
  /** Get all sizes */
  getSizes: () => unwrap(getSizesAction()),
  /** Get all conditions */
  getConditions: () => unwrap(getConditionsAction()),
  /** Get contact types */
  getContactTypes: () => unwrap(getContactTypesAction()),
  /** Get static data bundle */
  getStaticData: () => unwrap(getStaticDataAction()),
};

export type { Listing };
export { callApi } from '@/lib/api/call';
export type { ApiErrorHandler, CallApiOptions, ApiResult } from '@/lib/api/call';