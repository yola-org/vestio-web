import type { ApiResult } from "./result"

/** Share in-flight reads and successful results; failures remain retryable. */
export function cacheMetadata<T>(
  load: () => Promise<ApiResult<T>>,
  ttlMs = 60 * 60 * 1000,
): () => Promise<ApiResult<T>> {
  let pending: Promise<ApiResult<T>> | undefined
  let cached: ApiResult<T> | undefined
  let expiresAt = 0

  return () => {
    if (cached && Date.now() < expiresAt) return Promise.resolve(cached)
    if (pending) return pending

    pending = Promise.resolve()
      .then(load)
      .then((result) => {
        if (result.success) {
          cached = result
          expiresAt = Date.now() + ttlMs
        }
        return result
      })
      .finally(() => {
        pending = undefined
      })
    return pending
  }
}
