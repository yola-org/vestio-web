"use client"

// Claims select our channel and renewal time; AppSync validates the JWT.

import { useEffect } from "react"
import { isAuthenticated } from "@/lib/auth"
import { logger } from "@/lib/logger"
import {
  notificationsNamespace,
  chatNamespace,
  type RealtimeEvent,
} from "@/lib/realtime-events"

const httpEndpoint = process.env.NEXT_PUBLIC_APPSYNC_EVENTS_HTTP_ENDPOINT
const websocketEndpoint =
  process.env.NEXT_PUBLIC_APPSYNC_EVENTS_WEBSOCKET_ENDPOINT
const namespaces = [notificationsNamespace, chatNamespace]

export default function RealtimeListener({
  onEvent,
  onSessionChanged,
  onSubscribed,
}: {
  onEvent: (event: RealtimeEvent) => void
  onSessionChanged: () => void
  onSubscribed: (channel: string) => void
}) {
  useEffect(() => {
    let disposed = false
    let generation = 0
    let socket: WebSocket | undefined
    let retry: ReturnType<typeof setTimeout> | undefined
    let watchdog: ReturnType<typeof setTimeout> | undefined
    let expiry: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    let attempts = 0

    function disconnect() {
      generation++
      controller?.abort()
      clearTimeout(retry)
      clearTimeout(watchdog)
      clearTimeout(expiry)
      if (socket) {
        socket.onclose = null
        socket.close()
        socket = undefined
      }
    }

    function reconnect() {
      disconnect()
      if (disposed || !isAuthenticated()) return
      const delay = Math.min(30_000, 1_000 * 2 ** Math.min(attempts++, 5))
      retry = setTimeout(() => void connect(), delay + Math.random() * 1_000)
    }

    async function connect() {
      if (!httpEndpoint || !websocketEndpoint || disposed || !isAuthenticated())
        return
      const current = ++generation
      controller = new AbortController()
      try {
        const response = await fetch("/api/auth/realtime", {
          method: "POST",
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(7_000),
          ]),
        })
        if (disposed || current !== generation || !isAuthenticated()) {
          return
        }

        if (response.status === 401) {
          return
        }

        if (!response.ok) {
          throw new Error("Unable to load realtime session")
        }

        const { accessToken } = (await response.json()) as {
          accessToken: string
        }

        if (disposed || current !== generation || !isAuthenticated()) {
          return
        }

        const claims = JSON.parse(
          atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
        )

        const userId = claims.sub
        if (typeof userId !== "string" || typeof claims.exp !== "number") {
          throw new Error("Invalid realtime session claims")
        }

        const remaining = claims.exp * 1_000 - Date.now()
        if (remaining <= 0) throw new Error("Realtime session expired")
        const authorization = {
          host: new URL(httpEndpoint!).host,
          Authorization: accessToken,
        }
        const header = btoa(JSON.stringify(authorization))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "")

        const ws = new WebSocket(websocketEndpoint!, [
          "aws-appsync-event-ws",
          `header-${header}`,
        ])
        socket = ws
        const channels = namespaces.map(
          (namespace) => `/${namespace}/${userId}`,
        )
        let timeoutMs = 15_000
        const armWatchdog = () => {
          clearTimeout(watchdog)
          watchdog = setTimeout(reconnect, timeoutMs)
        }
        armWatchdog()
        expiry = setTimeout(reconnect, remaining + 1_000)
        ws.onopen = () => ws.send(JSON.stringify({ type: "connection_init" }))
        ws.onclose = reconnect
        ws.onerror = () => ws.close()
        ws.onmessage = ({ data }) => {
          if (disposed || current !== generation) return
          if (!isAuthenticated()) {
            disconnect()
            return
          }
          try {
            const message = JSON.parse(data)
            if (message.type === "connection_ack") {
              timeoutMs = message.connectionTimeoutMs || 300_000
              armWatchdog()
              channels.forEach((channel, index) => {
                ws.send(
                  JSON.stringify({
                    type: "subscribe",
                    id: String(index),
                    channel,
                    authorization,
                  }),
                )
              })
            } else if (message.type === "ka") {
              armWatchdog()
            } else if (message.type === "subscribe_success") {
              attempts = 0
              const channel = channels[Number(message.id)]
              if (channel) onSubscribed(channel)
              logger.info("APPSYNC_SUBSCRIBED", "Listening for events", {
                channel: channels[Number(message.id)],
              })
            } else if (message.type === "data") {
              const events = Array.isArray(message.event)
                ? message.event
                : [message.event]
              for (const event of events) {
                let payload: unknown = event
                if (typeof event === "string") {
                  try {
                    payload = JSON.parse(event)
                  } catch {}
                }
                const channel = channels[Number(message.id)]
                logger.info("APPSYNC_EVENT", "Received event", {
                  channel,
                  event: payload,
                })
                if (channel) onEvent({ channel, payload })
              }
            } else if (
              typeof message.type === "string" &&
              message.type.endsWith("error")
            ) {
              logger.warn("APPSYNC", new Error("Realtime operation failed"), {
                type: message.type,
                errors: message.errors,
              })
              reconnect()
            }
          } catch {
            logger.warn("APPSYNC", new Error("Invalid realtime message"))
          }
        }
      } catch {
        if (!disposed && current === generation) reconnect()
      }
    }

    function onAuthChanged() {
      disconnect()
      attempts = 0
      onSessionChanged()
      void connect()
    }

    window.addEventListener("vestio:auth-changed", onAuthChanged)
    const onOnline = () => {
      disconnect()
      attempts = 0
      void connect()
    }
    window.addEventListener("online", onOnline)

    void connect()

    return () => {
      disposed = true
      disconnect()
      window.removeEventListener("vestio:auth-changed", onAuthChanged)
      window.removeEventListener("online", onOnline)
    }
  }, [onEvent, onSessionChanged, onSubscribed])

  return null
}
