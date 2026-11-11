import "server-only"

import { cookies } from "next/headers"

import {
  AUTH_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  AUTH_ID_TOKEN_COOKIE,
  AUTH_INDICATOR_COOKIE,
} from "@/constants/auth"

import { ApiError } from "@/lib/api/api-error"
import { getApiError } from "@/lib/api/errors"
import { logger } from "@/lib/logger"

export { ApiError } from "@/lib/api/api-error"

const BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080"

const AUTH_COOKIES = [
  AUTH_TOKEN_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  AUTH_ID_TOKEN_COOKIE,
  AUTH_INDICATOR_COOKIE,
] as const

const NETWORK_ERROR_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
])

/**
 * Extract the error code from a native error or its cause.
 */
function getErrorCode(error: unknown): string | undefined {
  if (!(error instanceof Error)) {
    return undefined
  }

  const cause = (error as Error & { cause?: unknown }).cause

  if (typeof cause === "object" && cause !== null && "code" in cause) {
    return String(cause.code)
  }

  if ("code" in error) {
    return String(error.code)
  }

  return undefined
}

/**
 * Determine whether an error was caused by a network failure.
 */
function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const code = getErrorCode(error)

  if (code && NETWORK_ERROR_CODES.has(code)) {
    return true
  }

  return (
    error instanceof TypeError &&
    /fetch failed|failed to fetch|networkerror/i.test(error.message)
  )
}

/**
 * Parse an HTTP response without losing non-JSON response bodies.
 */
async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) {
    return undefined
  }

  if (response.headers.get("content-type")?.includes("application/json")) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  return text
}

/**
 * Execute an HTTP request against the backend API.
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = true,
): Promise<T> {
  const startTime = Date.now()
  const method = (options.method ?? "GET").toUpperCase()

  const headers = new Headers(options.headers)

  headers.set("Accept", "application/json, text/plain")

  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const cookieStore = includeAuth ? await cookies() : undefined
  const token = cookieStore?.get(AUTH_TOKEN_COOKIE)?.value

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const url = `${BASE_URL}${endpoint}`
  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers,
      next: options.next ?? { revalidate: 0 },
    })
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime
    const apiError = isNetworkError(error)
      ? new ApiError({
          timestamp: new Date().toISOString(),
          status: 503,
          error: "NETWORK_ERROR",
          message:
            error instanceof Error ? error.message : "Network request failed.",
          path: endpoint,
          validationErrors: [],
        })
      : getApiError(error)
    logger.error("API_REQUEST", apiError, { method, durationMs })
    throw apiError
  }

  if (response.status === 204) {
    logger.info("API_REQUEST", "no content", {
      method,
      path: endpoint,
      status: response.status,
      durationMs: Date.now() - startTime,
    })
    return undefined as T
  }

  const responseData = await parseResponse(response)
  const durationMs = Date.now() - startTime

  if (response.ok) {
    logger.info("API_REQUEST", "ok", {
      method,
      path: endpoint,
      status: response.status,
      durationMs,
    })
    return responseData as T
  }

  if (response.status === 401 && cookieStore) {
    for (const cookie of AUTH_COOKIES) {
      cookieStore.delete(cookie)
    }
  }

  const apiError = ApiError.createApiError(
    responseData,
    response.status,
    response.statusText,
    endpoint,
  )

  // 5xx, and 404/410 (missing route - e.g. contract drift after a backend
  // version bump) are logged as errors; other 4xx are client noise.
  if (
    response.status >= 500 ||
    response.status === 404 ||
    response.status === 410
  ) {
    logger.error("API_REQUEST", apiError, { method, durationMs })
  } else {
    logger.warn("API_REQUEST", apiError, { method, durationMs })
  }

  throw apiError
}
