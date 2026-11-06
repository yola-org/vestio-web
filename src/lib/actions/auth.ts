'use server';

import { cookies } from 'next/headers';
import { runAction, type ApiResult } from '@/lib/api/action-result.ts';
import { request } from '@/lib/api/request.ts';
import { AUTH_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE, AUTH_ID_TOKEN_COOKIE, AUTH_INDICATOR_COOKIE } from '@/constants/auth';
import { getTranslations } from 'next-intl/server';
import type { JwtResponse, LoginInput, SignupInput } from '@/lib/api/schemas';
import { LoginInputSchema, SignupInputSchema } from '@/lib/api/schemas';
import { parseInput } from '@/lib/api/validation';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function loginAction(credentials: LoginInput): Promise<ApiResult<null>> {
  return runAction(async () => {
    const input = parseInput(LoginInputSchema, credentials);
    const data = await request<JwtResponse>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify(input) },
      false
    );

    if (!data || !data.accessToken) {
      const t = await getTranslations();
      throw new Error(t('errors.authTokenMissing'));
    }

    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === 'production';
    
    cookieStore.set(AUTH_TOKEN_COOKIE, data.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    
    if (data.refreshToken) {
      cookieStore.set(AUTH_REFRESH_TOKEN_COOKIE, data.refreshToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });
    }

    if (data.idToken) {
      cookieStore.set(AUTH_ID_TOKEN_COOKIE, data.idToken, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });
    }

    cookieStore.set(AUTH_INDICATOR_COOKIE, '1', {
      httpOnly: false,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return null;
  });
}

export async function signupAction(credentials: SignupInput): Promise<ApiResult<string>> {
  return runAction(() => {
    const input = parseInput(SignupInputSchema, credentials);
    return request<string>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    }, false);
  });
}

export async function logoutAction(): Promise<ApiResult<null>> {
  return runAction(async () => {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_TOKEN_COOKIE);
    cookieStore.delete(AUTH_REFRESH_TOKEN_COOKIE);
    cookieStore.delete(AUTH_ID_TOKEN_COOKIE);
    cookieStore.delete(AUTH_INDICATOR_COOKIE);
    return null;
  });
}
