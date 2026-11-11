"use client"
/** Show the full-page loader while the form submits (default: true). */
/** Runs after either a successful or failed submission. */

/**
 * Connects a form's `action` directly to a Server Action while preserving the
 * shared API error handling and a React `pending` state for submit buttons.
 */

import { useActionState, useEffect, useRef } from "react"
import { useGlobalLoading } from "@/components/shared/GlobalLoadingProvider"
import { callApi } from "@/lib/api/call"
import type { ApiCallOptions, ApiResult } from "@/lib/api/result"

export interface UseApiFormOptions<T> extends ApiCallOptions<T> {
  loading?: boolean
  onComplete?: (result: ApiResult<T>) => void | Promise<void>
}
export function useApiForm<T>(
  submit: (formData: FormData) => Promise<ApiResult<T>>,
  options: UseApiFormOptions<T> = {},
) {
  const { setPending } = useGlobalLoading()
  const submitRef = useRef(submit)
  const optionsRef = useRef(options)

  useEffect(() => {
    submitRef.current = submit
    optionsRef.current = options
  })

  const [result, formAction, pending] = useActionState(
    async (_previous: ApiResult<T> | null, formData: FormData) => {
      const opts = optionsRef.current
      const showGlobalLoading = opts.loading ?? true
      if (showGlobalLoading) setPending(true)

      try {
        const nextResult = await callApi(submitRef.current(formData), opts)
        await opts.onComplete?.(nextResult)
        return nextResult
      } finally {
        if (showGlobalLoading) setPending(false)
      }
    },
    null,
  )

  return { result, formAction, pending }
}
