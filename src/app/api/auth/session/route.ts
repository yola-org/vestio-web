import { refreshPageSession } from "@/lib/api/request"

export async function POST() {
  const status = await refreshPageSession()
  return new Response(null, { status })
}
