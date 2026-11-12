import type { NextRequest } from "next/server"
import { z } from "zod"
import { AUTH_REFRESH_TOKEN_COOKIE, AUTH_TOKEN_COOKIE } from "@/constants/auth"
import { ApiError, request } from "@/lib/api/request"

const maxRequestBytes = 51 * 1024 * 1024
const listingIdSchema = z.uuid()

export async function PUT(
  incoming: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (
    !incoming.cookies.get(AUTH_TOKEN_COOKIE)?.value &&
    !incoming.cookies.get(AUTH_REFRESH_TOKEN_COOKIE)?.value
  ) {
    return new Response(null, { status: 401 })
  }

  const { id } = await params
  if (!listingIdSchema.safeParse(id).success) {
    return new Response(null, { status: 400 })
  }

  const length = Number(incoming.headers.get("content-length"))
  if (!Number.isSafeInteger(length) || length <= 0) {
    return new Response(null, { status: 411 })
  }
  if (length > maxRequestBytes) {
    return new Response(null, { status: 413 })
  }

  let images: FormData
  try {
    images = await incoming.formData()
  } catch {
    return new Response(null, { status: 400 })
  }

  const signal = AbortSignal.any([incoming.signal, AbortSignal.timeout(90_000)])
  try {
    await request<unknown>(`/api/listings/${id}/assets`, {
      method: "PUT",
      body: images,
      signal,
    })
    return new Response(null, { status: 204 })
  } catch (error) {
    const status = signal.aborted
      ? 504
      : error instanceof ApiError
        ? error.status
        : 502
    return new Response(null, { status })
  }
}
