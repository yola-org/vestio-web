"use server"

/** Count incoming offers across the whole unread inbox, including older pages. */

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
export async function getUnreadOffersAction() {
  return runAction(async () => {
    const offers = []
    for (let page = 0; ; page++) {
      const data = NotificationPageSchema.parse(
        await request(
          `/api/notifications?unreadOnly=true&page=${page}&size=100`,
          {
            cache: "no-store",
          },
        ),
      )
      offers.push(
        ...data.items.filter(
          (item) => item.type === "offer-sent" && !item.readAt,
        ),
      )
      if (page + 1 >= data.totalPages) break
    }
    return offers
  })
}

export async function markAllNotificationsReadAction() {
  return runAction(async () =>
    request<void>("/api/notifications/read-all", { method: "PUT" }),
  )
}
