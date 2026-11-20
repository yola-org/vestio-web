"use server"

import { z } from "zod"
import { runAction } from "@/lib/api/action-result"
import { request } from "@/lib/api/request"
import {
  NotificationSchema,
  NotificationPageSchema,
} from "@/lib/realtime-events"

export async function getNotificationsAction(page = 0) {
  return runAction(async () => {
    const number = z.number().int().nonnegative().parse(page)
    return NotificationPageSchema.parse(
      await request(`/api/notifications?page=${number}&size=20`, {
        cache: "no-store",
      }),
    )
  })
}

export async function markNotificationReadAction(id: string) {
  return runAction(async () =>
    NotificationSchema.parse(
      await request(`/api/notifications/${z.uuid().parse(id)}/read`, {
        method: "PUT",
      }),
    ),
  )
}

export async function markAllNotificationsReadAction() {
  return runAction(async () =>
    request<void>("/api/notifications/read-all", { method: "PUT" }),
  )
}
