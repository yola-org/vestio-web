import { test, expect, type WebSocketRoute } from "@playwright/test"
import { readFileSync } from "node:fs"
import { randomUUID } from "node:crypto"
import { setupAuthenticatedSession } from "../../helpers/api-mock"

const api = process.env.MOCK_API_URL || "http://localhost:8081"

test("saved history, pagination, read controls, and AppSync reconnect stay synchronized", async ({
  page,
  request,
}) => {
  // This integration test needs the same public endpoints in the app and test environment.
  test.skip(
    !process.env.NEXT_PUBLIC_APPSYNC_EVENTS_HTTP_ENDPOINT ||
      !process.env.NEXT_PUBLIC_APPSYNC_EVENTS_WEBSOCKET_ENDPOINT,
    "Realtime integration requires configured AppSync endpoints",
  )
  const userId = randomUUID()
  const token = `notification-test-${randomUUID()}`
  const headers = { Authorization: `Bearer ${token}` }
  const claims = Buffer.from(
    JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url")
  const accessToken = `test.${claims}.signature`
  let socket: WebSocketRoute | undefined
  let subscription: string | undefined
  let subscriptions = 0
  const logs: string[] = []
  page.on("console", (message) => logs.push(message.text()))
  await page.route("**/api/auth/realtime", (route) =>
    route.fulfill({ json: { accessToken } }),
  )
  await page.routeWebSocket(/\/event\/realtime/, (ws) => {
    socket = ws
    ws.onMessage((raw) => {
      const message = JSON.parse(String(raw))
      if (message.type === "connection_init")
        ws.send(
          JSON.stringify({
            type: "connection_ack",
            connectionTimeoutMs: 300000,
          }),
        )
      if (message.type === "subscribe") {
        expect(message.channel).toContain(userId)
        if (message.channel.startsWith("/notifications/")) {
          subscription = message.id
          subscriptions++
        }
        ws.send(JSON.stringify({ type: "subscribe_success", id: message.id }))
      }
    })
  })
  const notification = (title: string, index = 0) => ({
    id: randomUUID(),
    userId,
    type: "listing-created",
    payload: { listingTitle: title },
    listingId: randomUUID(),
    createdAt: new Date(Date.now() - index * 60000).toISOString(),
    readAt: null,
  })
  const history = Array.from({ length: 21 }, (_, index) =>
    notification(`Saved shirt ${index}`, index),
  )
  const seed = async (items: unknown[]) => {
    expect(
      (
        await request.post(`${api}/__test/notifications`, {
          headers,
          data: items,
        })
      ).ok(),
    ).toBeTruthy()
  }
  const all = async () =>
    (
      await (
        await request.get(`${api}/api/notifications?size=100`, { headers })
      ).json()
    ).items
  await seed(history)
  await setupAuthenticatedSession(page)
  await page
    .context()
    .addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
    ])
  await page.goto("/")
  const bell = (count: number) =>
    page
      .getByRole("button", {
        name: `Notifications, ${count} non lues`,
        exact: true,
      })
      .filter({ visible: true })
  await expect(bell(21)).toBeVisible()
  await expect.poll(() => subscription, { timeout: 15000 }).toBeDefined()
  await bell(21).click()
  await expect(
    page.getByText(
      "Votre article « Saved shirt 0 » est en attente. Nous préparons ses photos.",
    ),
  ).toBeVisible()
  await page.getByRole("button", { name: "Voir plus", exact: true }).click()
  await expect(
    page.getByText(
      "Votre article « Saved shirt 20 » est en attente. Nous préparons ses photos.",
    ),
  ).toBeVisible()
  await page
    .getByRole("listitem")
    .filter({ hasText: "« Saved shirt 0 »" })
    .getByRole("button", { name: "Marquer comme lue", exact: true })
    .click()
  await expect(bell(20)).toBeVisible()
  await page.reload()
  await expect(bell(20)).toBeVisible()
  await bell(20).click()
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "« Saved shirt 0 »" })
      .getByRole("button", { name: "Marquer comme lue", exact: true }),
  ).toHaveCount(0)

  const live = { ...notification("Live shirt"), type: "listing-published" }
  await seed([live, ...(await all())])
  const payload = {
    id: live.id,
    type: "notification",
    occurredAt: new Date().toISOString(),
    payload: live,
  }
  const emit = () =>
    socket!.send(
      JSON.stringify({
        type: "data",
        id: subscription,
        event: [JSON.stringify(payload)],
      }),
    )
  emit()
  await expect(bell(21)).toBeVisible()
  await expect(
    page.getByText("Votre article « Live shirt » est prêt et en ligne."),
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Voir mon article", exact: true }),
  ).toHaveAttribute("href", `/listings/${live.listingId}`)
  emit()
  await expect
    .poll(() => logs.filter((line) => line.includes("APPSYNC_EVENT")).length)
    .toBe(2)
  await expect(
    page.getByText("Votre article « Live shirt » est prêt et en ligne."),
  ).toHaveCount(1)
  await page.getByRole("button", { name: "Tout marquer comme lu" }).click()
  await expect(bell(0)).toBeVisible()
  expect(
    (await all()).every((item: { readAt: string | null }) => item.readAt),
  ).toBeTruthy()
  await page.reload()
  await expect(bell(0)).toBeVisible()
  await bell(0).click()
  await expect(
    page.getByText("Votre article « Live shirt » est prêt et en ligne."),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Marquer comme lue", exact: true }),
  ).toHaveCount(0)

  const offerEvent = JSON.parse(
    readFileSync(
      new URL("../../fixtures/offer-sent-event.json", import.meta.url),
      "utf8",
    ),
  )
  offerEvent.id = randomUUID()
  offerEvent.payload.id = offerEvent.id
  offerEvent.payload.userId = userId
  offerEvent.occurredAt = new Date().toISOString()
  offerEvent.payload.createdAt = offerEvent.occurredAt
  await seed([offerEvent.payload, ...(await all())])
  const emitOffer = () =>
    socket!.send(
      JSON.stringify({
        type: "data",
        id: subscription,
        event: [JSON.stringify(offerEvent)],
      }),
    )
  emitOffer()
  await expect(bell(1)).toBeVisible()
  const offerMessage =
    "Vous avez reçu une offre de 125,50 DH de la part de Sara Benali pour « Veste en jean »."
  await expect(page.getByText(offerMessage, { exact: true })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Voir l’offre", exact: true }),
  ).toHaveAttribute("href", "/offers/received")
  emitOffer()
  await expect(page.getByText(offerMessage, { exact: true })).toHaveCount(1)
  await page
    .getByRole("listitem")
    .filter({ hasText: offerMessage })
    .getByRole("button", { name: "Marquer comme lue", exact: true })
    .click()
  await expect(bell(0)).toBeVisible()
  await page.reload()
  await expect(bell(0)).toBeVisible()
  await bell(0).click()
  await expect(page.getByText(offerMessage, { exact: true })).toBeVisible()

  const missed = notification("Offline shirt")
  await seed([missed, ...(await all())])
  const previous = subscriptions
  socket!.close({ code: 1001, reason: "Reconnect test" })
  await expect
    .poll(() => subscriptions, { timeout: 15000 })
    .toBeGreaterThan(previous)
  await expect(bell(1)).toBeVisible()
  await expect(
    page.getByText(
      "Votre article « Offline shirt » est en attente. Nous préparons ses photos.",
    ),
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await bell(1).click()
  await page.screenshot({ path: "/tmp/vestio-notification-history.png" })
  await page.context().clearCookies()
  await page.evaluate(() =>
    window.dispatchEvent(new Event("vestio:auth-changed")),
  )
  await expect(
    page.getByRole("button", { name: /^Notifications,/ }),
  ).toHaveCount(0)
})

for (const timeZone of ["America/Toronto", "Asia/Tokyo"]) {
  test.describe(timeZone, () => {
    test.use({ timezoneId: timeZone })

    test("displays UTC notification timestamps locally across midnight and DST", async ({
      page,
      request,
    }) => {
      const token = `notification-test-${randomUUID()}`
      const createdTimes = [
        "2026-11-20T02:30:00Z",
        "2026-11-01T05:30:00Z",
        "2026-11-01T06:30:00Z",
      ]
      const userId = randomUUID()
      const response = await request.post(`${api}/__test/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        data: createdTimes.map((createdAt) => ({
          id: randomUUID(),
          userId,
          type: "listing-created",
          payload: { listingTitle: `UTC ${createdAt}` },
          listingId: null,
          readAt: null,
          createdAt,
        })),
      })
      expect(response.ok()).toBeTruthy()
      await setupAuthenticatedSession(page)
      await page.context().addCookies([
        { name: "vestio_token", value: token, domain: "localhost", path: "/" },
        { name: "vestio_locale", value: "fr", domain: "localhost", path: "/" },
      ])
      await page.goto("/")
      const bell = page
        .getByRole("button", { name: "Notifications, 3 non lues", exact: true })
        .filter({ visible: true })
      await expect(bell).toBeVisible()
      await bell.click()
      for (const createdAt of createdTimes) {
        const expected = new Intl.DateTimeFormat("fr", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone,
        }).format(new Date(createdAt))
        await expect(page.locator(`time[datetime="${createdAt}"]`)).toHaveText(
          expected,
        )
      }
      if (timeZone === "America/Toronto") {
        await expect(
          page.locator(`time[datetime="${createdTimes[0]}"]`),
        ).toContainText("19")
        // The two UTC instants straddle the DST fallback and share one local wall time.
        expect(
          await page
            .locator(`time[datetime="${createdTimes[1]}"]`)
            .textContent(),
        ).toBe(
          await page
            .locator(`time[datetime="${createdTimes[2]}"]`)
            .textContent(),
        )
      }
    })
  })
}
