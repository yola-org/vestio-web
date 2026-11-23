# Server Actions

Server actions live in `src/lib/actions/`. They run on the server and have direct access to cookies and the API.

## Rules

- Always add `'use server'` at the top.
- Return `ActionResult<T>` from `src/lib/api/action-result.ts` — either `{ ok: true, data }` or `{ ok: false, error, fieldErrors? }`.
- Catch `ApiError` and return its message; catch everything else and return a generic message.
- Set cookies with `httpOnly: true`, `secure` in production, `sameSite: 'lax'`.
- Use `revalidatePath` / `revalidateTag` after mutations that affect cached pages.
- Use `redirect()` after logout or flows that require a page change.

## Auth cookie names

Defined in `src/constants/auth.ts` — keep cookie names synchronized between actions and the mock backend in tests.

## Error handling

`ApiError` carries a structured `status`, `error`, and `validationErrors`. Surface `validationErrors` as `fieldErrors` in the result when the API returns field-level failures.
