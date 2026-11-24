"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { runAction, type ApiResult } from "@/lib/api/action-result.ts"
import { request } from "@/lib/api/request.ts"
import { clearAuthCookies, startAuthSession } from "@/lib/api/auth-cookies"
import { getTranslations } from "next-intl/server"
import type {
  JwtResponse,
  LoginInput,
  SignupInput,
  ResetPasswordInput,
} from "@/lib/api/schemas"
import {
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
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

export async function confirmEmailAction(
  email: string,
  pin: string,
): Promise<ApiResult<string>> {
  return runAction(() =>
    request<string>(
      "/api/auth/confirm-email",
      {
        method: "POST",
        body: JSON.stringify({
          email: parseInput(LoginInputSchema.shape.email, email),
          pin: parseInput(z.string().regex(/^[0-9]{6}$/), pin),
        }),
      },
      false,
    ),
  )
}

export async function resendConfirmationAction(
  email: string,
): Promise<ApiResult<string>> {
  return runAction(() =>
    request<string>(
      "/api/auth/resend-confirmation",
      {
        method: "POST",
        body: JSON.stringify({
          email: parseInput(LoginInputSchema.shape.email, email),
        }),
      },
      false,
    ),
  )
}

export async function forgotPasswordAction(
  email: string,
): Promise<ApiResult<string>> {
  return runAction(() => {
    const input = parseInput(ForgotPasswordInputSchema, { email })
    return request<string>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      false,
    )
  })
}

export async function resetPasswordAction(
  credentials: ResetPasswordInput,
): Promise<ApiResult<string>> {
  return runAction(async () => {
    const { confirmPassword, ...input } = parseInput(
      ResetPasswordInputSchema,
      credentials,
    )
    const message = await request<string>(
      "/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      false,
    )
    clearAuthCookies(await cookies())
    return message
  })
}
