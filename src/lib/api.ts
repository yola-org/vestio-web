/**
 * API facade - re-exports API modules for convenient imports
 * @module lib/api
 */

export { authApi, listingsApi, profileApi } from "@/lib/api/index"
export type { Listing } from "@/lib/api/index"
export { callApi } from "@/lib/api/call"
export type {
  ApiCallOptions,
  ApiErrorAction,
  ApiErrorConfig,
  ApiErrorHandler,
  ApiResult,
  ApiError,
} from "@/lib/api/result"
