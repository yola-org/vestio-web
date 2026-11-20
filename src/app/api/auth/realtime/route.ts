import { cookies } from "next/headers"
import { AUTH_TOKEN_COOKIE } from "@/constants/auth"
import { refreshPageSession } from "@/lib/api/request"

// AppSync needs the backend-issued access token. The refresh token stays HttpOnly.
export async function POST() {
  const headers = { "Cache-Control": "no-store" }
  const status = await refreshPageSession()
  if (status !== 204) return new Response(null, { status, headers })
  const accessToken = (await cookies()).get(AUTH_TOKEN_COOKIE)?.value
  if (!accessToken) return new Response(null, { status: 401, headers })
  return Response.json({ accessToken }, { headers })
}
