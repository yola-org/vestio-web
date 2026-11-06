'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { callApi } from '@/lib/api/call';
import type { ApiCallOptions, ApiResult, ApiError } from '@/lib/api/result';
import { useGlobalLoading } from '@/components/shared/GlobalLoadingProvider';

/**
 * Options for {@link useApiAction}.
 * Extends the normal `callApi` options with hook-only settings.
 */
export interface UseApiActionOptions<T> extends ApiCallOptions<T> {
  /** Initial value for the loading state (default: false) */
  initialLoading?: boolean;
  /** Initial value for the data state (default: null) */
  initialData?: T | null;
  /** Show the full-page loader while this call is pending (default: true). */
  loading?: boolean;
  /** Runs after either a successful or failed API call. */
  onComplete?: (result: ApiResult<T>) => void | Promise<void>;
}

/**
 * State exposed by {@link useApiAction}.
 */
export interface UseApiActionState<T> {
  /** Latest successful data, or the initial value */
  data: T | null;
  /** Latest error, if the last execution failed */
  error: ApiError | null;
  /** True while the action is running */
  loading: boolean;
  /** Clears data, error and loading */
  reset: () => void;
}

export interface UseApiActionResult<TArgs extends unknown[], T>
  extends UseApiActionState<T> {
  /** Runs the server action and updates data/error/loading */
  execute: (...args: TArgs) => Promise<ApiResult<T>>;
}

/**
 * Manages loading/data/error for a server action.
 *
 * Use this for mutations (forms, buttons) or when the action must be
 * triggered manually.
 *
 * @example
 * ```ts
 * const save = useApiAction(profileApi.update, {
 *   onSuccess: () => notify.success(t('settings.success')),
 *   onError: () => notify.error(t('settings.error')),
 * });
 *
 * await save.execute({ firstName, lastName });
 * save.loading; // true while running
 * ```
 */
export function useApiAction<TArgs extends unknown[], T>(
    action: (...args: TArgs) => Promise<ApiResult<T>>,
    options: UseApiActionOptions<T> = {}
): UseApiActionResult<TArgs, T> {
  const { setPending } = useGlobalLoading();
  const actionRef = useRef(action);
  const optionsRef = useRef(options);
  useEffect(() => {
    actionRef.current = action;
    optionsRef.current = options;
  });

  const [data, setData] = useState<T | null>(options.initialData ?? null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(options.initialLoading ?? false);

  const requestIdRef = useRef(0);

  // Unmount invalidates every in-flight request
  useEffect(() => () => { requestIdRef.current++; }, []);

  const reset = useCallback(() => {
    requestIdRef.current++; // also cancel pending results
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const execute = useCallback(async (...args: TArgs) => {
    const id = ++requestIdRef.current;
    const isLatest = () => id === requestIdRef.current;
    const opts = optionsRef.current;

    setLoading(true);
    setError(null);

    const showGlobalLoading = opts.loading ?? true;
    if (showGlobalLoading) setPending(true);

    try {
      const result = await callApi(actionRef.current(...args), {
        errors: opts.errors,
        silent: opts.silent,
        onSuccess: async (value) => {
          if (!isLatest()) return;
          setData(value);
          await opts.onSuccess?.(value);
        },
        onError: async (err) => {
          if (!isLatest()) return;
          setError(err);
          await opts.onError?.(err);
        },
      });
      await opts.onComplete?.(result);
      return result;
    }finally {
      if (isLatest()) setLoading(false);
      if (showGlobalLoading) setPending(false);
    }
  }, []);

  return { data, error, loading, execute, reset };
}
