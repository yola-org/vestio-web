# Server Actions Documentation

Server Actions are used for form submissions and mutations that need to run on the server, with direct access to cookies, headers, and the database/API.

## Location
Server Actions are in `src/lib/actions/` directory.

## Pattern

All server actions should:
- Use `'use server'` directive
- Return `ActionResult<T>` type for consistent error handling
- Handle API errors properly
- Use the `request()` function from the API layer

### ActionResult Type

```typescript
// src/lib/api/action-result.ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
```

## Example Usage

### Defining a Server Action

```typescript
'use server';

import { cookies } from 'next/headers';
import { request } from '@/lib/api/request';
import { ActionResult } from '@/lib/api/action-result';
import { ApiError } from '@/lib/api/request';
import { AUTH_TOKEN_COOKIE, AUTH_INDICATOR_COOKIE } from '@/constants/auth';

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  // ...
}

export async function loginAction(data: LoginData): Promise<ActionResult<AuthResponse>> {
  try {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const cookieStore = await cookies();
    cookieStore.set(AUTH_TOKEN_COOKIE, response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    cookieStore.set(AUTH_INDICATOR_COOKIE, '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return { ok: true, data: response };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'An unexpected error occurred' };
  }
}
```

### Using in Client Components

```typescript
'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions/auth';
import { notifyAuthChanged } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [error, setError] = useState('');
  const router = useRouter();
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const result = await loginAction({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
    
    if (!result.ok) {
      setError(result.error);
      return;
    }
    
    notifyAuthChanged();
    router.push('/');
    router.refresh();
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

## Best Practices

### Security
- Always validate input on the server
- Use HTTP-only cookies for sensitive tokens
- Don't trust client data
- Implement CSRF protection if needed (Next.js has built-in protection)

### Error Handling
- Catch `ApiError` and extract message
- Return user-friendly error messages
- Use `fieldErrors` for form field validation errors
- Log errors appropriately

### Cookies
- Set appropriate cookie options (httpOnly, secure, sameSite)
- Delete cookies on logout
- Use the indicator cookie for client-side auth detection

### Performance
- Keep server actions focused and fast
- Use `revalidatePath` or `revalidateTag` if needed for cache invalidation
- Redirect after mutations using `redirect()` from next/navigation

### Type Safety
- Type action parameters and return values
- Use ActionResult for consistent returns
- Share types between client and server

## Common Patterns

### With FormData
```typescript
export async function action(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  // ...
}
```

### With revalidation
```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createPostAction(data: PostData) {
  await request('/posts', { method: 'POST', body: JSON.stringify(data) });
  revalidatePath('/posts');
  return { ok: true };
}
```

### With redirect
```typescript
'use server';

import { redirect } from 'next/navigation';

export async function logoutAction() {
  // ... clear cookies
  redirect('/login');
}
```
