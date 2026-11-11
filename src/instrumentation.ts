import { registerOTel } from "@vercel/otel"

// Must match the backend origin `request.ts` uses - only these URLs get the
// W3C trace context (`traceparent`) header, so the backend can continue
// the same trace. Hardcoding localhost here would silently break trace
// correlation in any other environment.
function backendOriginPattern(): RegExp {
  try {
    const raw =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080"
    return new RegExp(
      `^${new URL(raw).origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    )
  } catch {
    return /^http:\/\/localhost:8080/
  }
}

export function register() {
  registerOTel({
    serviceName: "vestio-web-frontend",
    instrumentationConfig: {
      fetch: {
        // Only attach traceparent to your own backend
        propagateContextUrls: [backendOriginPattern()],
      },
    },
  })
}
