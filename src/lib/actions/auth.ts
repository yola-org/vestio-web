"use server"

import { cookies } from "next/headers"
import { runAction, type ApiResult } from "@/lib/api/action-result.ts"
import { request } from "@/lib/api/request.ts"
import { clearAuthCookies, startAuthSession } from "@/lib/api/auth-cookies"
import { getTranslations } from "next-intl/server"
import type { JwtResponse, LoginInput, SignupInput } from "@/lib/api/schemas"
import {
  JwtResponseSchema,
  LoginInputSchema,
  SignupInputSchema,
} from "@/lib/api/schemas"
import { parseInput } from "@/lib/api/validation"

export async function loginAction(
  credentials: LoginInput,
): Promise<ApiResult<null>> {
  return runAction(async () => {
    const input = parseInput(LoginInputSchema, credentials)
    const data = await request<JwtResponse>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(input) },
      false,
    )

    if (!data || !data.accessToken) {
      const t = await getTranslations()
      throw new Error(t("errors.authTokenMissing"))
    }

    startAuthSession(await cookies(), JwtResponseSchema.parse(data))

    return null
  })
}

export async function signupAction(
  credentials: SignupInput,
): Promise<ApiResult<string>> {
  return runAction(() => {
    const input = parseInput(SignupInputSchema, credentials)
    return request<string>(
      "/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      false,
    )
  })
}

export async function logoutAction(): Promise<ApiResult<null>> {
  return runAction(async () => {
    clearAuthCookies(await cookies())
    return null
  })
}
