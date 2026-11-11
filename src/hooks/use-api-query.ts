"use client"

/**
 * Options for {@link useApiQuery}.
 */
/** Dependencies that trigger a refetch (like `useEffect` deps) */
/** Set to false to delay the request (default: true) */
/** Re-runs the query manually */

/**
 * Runs a server action automatically and exposes its loading/data/error state.
 *
 * Use this for reads that should happen on mount or when dependencies change.
 * It removes the repeated `useState` + `useEffect` + `setLoading` boilerplate
 * from every page/component.
 *
 * @example
 * ```ts
 * const { data: categories, loading } = useApiQuery(
 *   profileApi.getCategories,
 *   { critical: true, loading: false } // must-have data: failure shows a severe error and goes to /500
 * );
 *
 * const { data: listings, loading } = useApiQuery(
 *   () => listingsApi.list(page - 1, limit),
 *   { deps: [page, limit] }
 * );
 * ```
 */
// `deps` intentionally controls when the query re-runs.
// eslint-disable-next-line react-hooks/exhaustive-deps

import { useEffect, useRef, type DependencyList } from "react"
import {
  useApiAction,
  type UseApiActionOptions,
  type UseApiActionResult,
} from "@/hooks/use-api-action"
import type { ApiResult } from "@/lib/api/result"
export interface UseApiQueryOptions<T> extends UseApiActionOptions<T> {
  deps?: DependencyList
  enabled?: boolean
}

export interface UseApiQueryResult<T> extends UseApiActionResult<[], T> {
  refetch: () => Promise<ApiResult<T>>
}
export function useApiQuery<T>(
  action: () => Promise<ApiResult<T>>,
  options: UseApiQueryOptions<T> = {},
): UseApiQueryResult<T> {
  const { deps = [], enabled = true, ...actionOptions } = options

  const { execute, ...state } = useApiAction(action, {
    ...actionOptions,
    initialLoading: actionOptions.initialLoading ?? enabled,
  })

  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    if (enabledRef.current) {
      void execute()
    }
  }, deps)

  return { ...state, execute, refetch: execute }
}
