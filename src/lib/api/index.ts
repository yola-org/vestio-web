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
 * Authentication API - server actions
 */
export const authApi = {
  /** Login with credentials */
  login: (credentials: LoginRequest) => loginAction(credentials),
  /** Sign up new user */
  signup: (credentials: SignupRequest) => signupAction(credentials),
  /** Logout current session */
  logout: () => logoutAction(),
};

/**
 * Listings API - server actions
 */
export const listingsApi = {
  /** Get paginated listings */
  list: (page = 0, size = 12) => getListingsAction(page, size),
  /** Get single listing by ID */
  get: (id: string) => getListingAction(id),
  /** Create new listing */
  create: (listing: ListingInput) => createListingAction(listing),
  /** Update existing listing */
  update: (id: string, listing: ListingInput) => updateListingAction(id, listing),
  /** Delete listing */
  delete: (id: string) => deleteListingAction(id),
};

/**
 * Profile and metadata API - server actions
 */
export const profileApi = {
  /** Get current user profile */
  get: () => getProfileAction(),
  /** Update user profile */
  update: (profile: Partial<UserProfile>) => updateProfileAction(profile),
  /** Get onboarding status */
  getOnboardingStatus: () => getOnboardingStatusAction(),
  /** Get user preferences */
  getPreferences: () => getPreferencesAction(),
  /** Update user preferences */
  updatePreferences: (preferences: UserPreferences) => updatePreferencesAction(preferences),
  /** Get all categories */
  getCategories: () => getCategoriesAction(),
  /** Get category groups */
  getCategoryGroups: () => getCategoryGroupsAction(),
  /** Get all cities */
  getCities: () => getCitiesAction(),
  /** Get all sizes */
  getSizes: () => getSizesAction(),
  /** Get all conditions */
  getConditions: () => getConditionsAction(),
  /** Get contact types */
  getContactTypes: () => getContactTypesAction(),
  /** Get static data bundle */
  getStaticData: () => getStaticDataAction(),
};

export type { Listing };
export { callApi } from '@/lib/api/call';
export type { ApiErrorHandler, CallApiOptions, ApiResult } from '@/lib/api/call';