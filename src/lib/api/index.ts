import { metadataApi } from "@/lib/api/metadata"
import {
  createListingAction,
  deleteListingAction,
  getFavoritesAction,
  getListingAction,
  getListingsAction,
  getMyListingsAction,
  getPendingListingsAction,
  setFavoriteAction,
  updateListingAction,
} from "@/lib/actions/listings"
import {
  loginAction,
  logoutAction,
  signupAction,
  forgotPasswordAction,
  resetPasswordAction,
} from "@/lib/actions/auth"
import {
  getPreferencesAction,
  getProfileAction,
  updatePreferencesAction,
  updateProfileAction,
  uploadProfileImageAction,
} from "@/lib/actions/profile"
import type {
  Category,
  City,
  Listing,
  ListingSummary,
  ListingInput,
  LoginInput,
  SignupInput,
  ResetPasswordInput,
  UserPreferencesInput,
  UserProfile,
} from "@/lib/api/schemas"

/**
 * Authentication API - server actions
 */
export const authApi = {
  /** Login with credentials */
  login: (credentials: LoginInput) => loginAction(credentials),
  /** Sign up new user */
  signup: (credentials: SignupInput) => signupAction(credentials),
  forgotPassword: (email: string) => forgotPasswordAction(email),
  resetPassword: (input: ResetPasswordInput) => resetPasswordAction(input),
  /** Logout current session */
  logout: () => logoutAction(),
}

/**
 * Listings API - server actions
 */
export const listingsApi = {
  /** Get paginated listings */
  list: (page = 0, size = 12) => getListingsAction(page, size),
  /** Get single listing by ID */
  get: (id: string) => getListingAction(id),
  mine: getMyListingsAction,
  favorites: getFavoritesAction,
  pending: getPendingListingsAction,
  setFavorite: setFavoriteAction,
  /** Create new listing */
  create: (listing: ListingInput) => createListingAction(listing),
  /** Update existing listing */
  update: (id: string, listing: ListingInput) =>
    updateListingAction(id, listing),
  /** Delete listing */
  delete: (id: string) => deleteListingAction(id),
}

/**
 * Profile and metadata API - server actions
 */
export const profileApi = {
  /** Get current user profile */
  get: () => getProfileAction(),
  /** Update user profile */
  update: (profile: Partial<UserProfile>) => updateProfileAction(profile),
  uploadImage: (image: File) => uploadProfileImageAction(image),
  /** Get user preferences */
  getPreferences: () => getPreferencesAction(),
  /** Update user preferences */
  updatePreferences: (preferences: UserPreferencesInput) =>
    updatePreferencesAction(preferences),
  ...metadataApi,
}

export type { Listing, ListingSummary }
export { callApi } from "@/lib/api/call"
export type {
  ApiCallOptions,
  ApiErrorAction,
  ApiErrorConfig,
  ApiErrorHandler,
  ApiError,
  ApiResult,
} from "@/lib/api/result"
