import "server-only"

import { cookies } from "next/headers"
import {
  AUTH_ID_TOKEN_COOKIE,
  AUTH_INDICATOR_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  AUTH_TOKEN_COOKIE,
} from "@/constants/auth"
import type { JwtResponse } from "@/lib/api/schemas"

type CookieStore = Awaited<ReturnType<typeof cookies>>

const SESSION_MAX_AGE = 60 * 60 * 24 * 7
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const

export function writeTokenCookies(
  cookieStore: CookieStore,
  tokens: JwtResponse,
) {
  const maxAge = Math.min(tokens.expiresIn, SESSION_MAX_AGE)
  cookieStore.set(AUTH_TOKEN_COOKIE, tokens.accessToken, {
    ...cookieOptions,
    maxAge,
  })
  cookieStore.set(AUTH_ID_TOKEN_COOKIE, tokens.idToken, {
    ...cookieOptions,
    maxAge,
  })

  // Cognito omits this field when refresh token rotation is disabled.
  if (tokens.refreshToken) {
    cookieStore.set(AUTH_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: SESSION_MAX_AGE,
    })
  }
}

export function startAuthSession(
  cookieStore: CookieStore,
  tokens: JwtResponse,
) {
  if (!tokens.refreshToken) cookieStore.delete(AUTH_REFRESH_TOKEN_COOKIE)
  writeTokenCookies(cookieStore, tokens)
  cookieStore.set(AUTH_INDICATOR_COOKIE, "1", {
    ...cookieOptions,
    httpOnly: false,
    maxAge: SESSION_MAX_AGE,
  })
}

export function clearAuthCookies(cookieStore: CookieStore) {
  cookieStore.delete(AUTH_TOKEN_COOKIE)
  cookieStore.delete(AUTH_REFRESH_TOKEN_COOKIE)
  cookieStore.delete(AUTH_ID_TOKEN_COOKIE)
  cookieStore.delete(AUTH_INDICATOR_COOKIE)
}
