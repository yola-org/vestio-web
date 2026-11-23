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
  const inbox = page.getByRole("region", { name: "Notifications", exact: true })
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
    inbox.getByText(
      "Votre article « Saved shirt 0 » est en attente. Nous préparons ses photos.",
    ),
  ).toBeVisible()
  await page.getByRole("button", { name: "Voir plus", exact: true }).click()
  await expect(
    inbox.getByText(
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
    inbox.getByText("Votre article « Live shirt » est prêt et en ligne."),
  ).toBeVisible()
  await expect(
    inbox.getByRole("link", { name: "Voir mon article", exact: true }),
  ).toHaveAttribute("href", `/listings/${live.listingId}`)
  emit()
  await expect
    .poll(() => logs.filter((line) => line.includes("APPSYNC_EVENT")).length)
    .toBe(2)
  await expect(
    inbox.getByText("Votre article « Live shirt » est prêt et en ligne."),
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
    inbox.getByText("Votre article « Live shirt » est prêt et en ligne."),
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
  await expect(inbox.getByText(offerMessage, { exact: true })).toBeVisible()
  await expect(
    inbox.getByRole("link", { name: "Voir l’offre", exact: true }),
  ).toHaveAttribute("href", "/offers/received")
  emitOffer()
  await expect(inbox.getByText(offerMessage, { exact: true })).toHaveCount(1)
  await page
    .getByRole("listitem")
    .filter({ hasText: offerMessage })
    .getByRole("button", { name: "Marquer comme lue", exact: true })
    .click()
  await expect(bell(0)).toBeVisible()
  await page.reload()
  await expect(bell(0)).toBeVisible()
  await bell(0).click()
  await expect(inbox.getByText(offerMessage, { exact: true })).toBeVisible()

  const accepted = {
    ...notification("Veste en jean"),
    type: "offer-accepted",
    payload: {
      offerId: randomUUID(),
      chatId: randomUUID(),
      amount: 125.5,
      currency: "MAD",
      ownerName: "Alex Owner",
      buyerName: "Sara Benali",
      listingTitle: "Veste en jean",
    },
  }
  await seed([accepted, ...(await all())])
  const acceptedEvent = {
    id: accepted.id,
    type: "notification",
    occurredAt: accepted.createdAt,
    payload: accepted,
  }
  const emitAccepted = () =>
    socket!.send(
      JSON.stringify({
        type: "data",
        id: subscription,
        event: [JSON.stringify(acceptedEvent)],
      }),
    )
  emitAccepted()
  const acceptedAmount = new Intl.NumberFormat("fr", {
    style: "currency",
    currency: "MAD",
    currencyDisplay: "code",
  }).format(125.5)
  const acceptedMessage = `Votre offre de ${acceptedAmount} pour « Veste en jean » a été acceptée par Alex Owner.`
  await expect(bell(1)).toBeVisible()
  await expect(inbox.getByText(acceptedMessage, { exact: true })).toBeVisible()
  const acceptedRow = page
    .getByRole("listitem")
    .filter({ hasText: acceptedMessage })
  await expect(
    acceptedRow.getByRole("link", {
      name: "Ouvrir la conversation",
      exact: true,
    }),
  ).toHaveAttribute("href", `/chats/${accepted.payload.chatId}`)
  emitAccepted()
  await expect(inbox.getByText(acceptedMessage, { exact: true })).toHaveCount(1)
  await acceptedRow
    .getByRole("button", { name: "Marquer comme lue", exact: true })
    .click()
  await expect(bell(0)).toBeVisible()
  await page.reload()
  await bell(0).click()
  await expect(inbox.getByText(acceptedMessage, { exact: true })).toBeVisible()

  const missed = notification("Offline shirt")
  await seed([missed, ...(await all())])
  const previous = subscriptions
  socket!.close({ code: 1001, reason: "Reconnect test" })
  await expect
    .poll(() => subscriptions, { timeout: 15000 })
    .toBeGreaterThan(previous)
  await expect(bell(1)).toBeVisible()
  await expect(
    inbox.getByText(
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

for (const locale of ["fr", "ar"] as const) {
  test(`saved offer acceptance is localized, validates its payload, and opens its chat (${locale})`, async ({
    page,
    request,
  }) => {
    const token = `notification-test-${randomUUID()}`
    const headers = { Authorization: `Bearer ${token}` }
    const accepted = {
      id: randomUUID(),
      userId: randomUUID(),
      type: "offer-accepted",
      listingId: randomUUID(),
      createdAt: new Date().toISOString(),
      readAt: null,
      payload: {
        offerId: randomUUID(),
        chatId: randomUUID(),
        amount: 125.5,
        currency: "USD",
        ownerName: "Alex Owner",
        buyerName: "Sara Benali",
        listingTitle: "Veste en jean",
      },
    }
    const malformed = {
      ...accepted,
      id: randomUUID(),
      payload: { ...accepted.payload, currency: "INVALID" },
    }
    const sent = {
      ...accepted,
      id: randomUUID(),
      type: "offer-sent",
      payload: {
        offerId: randomUUID(),
        amount: 125.5,
        senderId: randomUUID(),
        senderName: "Sara Benali",
        listingTitle: "Veste en jean",
      },
    }
    expect(
      (
        await request.post(`${api}/__test/notifications`, {
          headers,
          data: [accepted, malformed, sent],
        })
      ).ok(),
    ).toBeTruthy()
    await request.post(`${api}/__test/chats`, {
      headers,
      data: {
        senderId: accepted.userId,
        messages: [],
        chats: [
          {
            id: accepted.payload.chatId,
            offerId: accepted.payload.offerId,
            listingId: accepted.listingId,
            listingTitle: accepted.payload.listingTitle,
            ownerId: randomUUID(),
            ownerName: accepted.payload.ownerName,
            buyerId: accepted.userId,
            buyerName: accepted.payload.buyerName,
            createdAt: accepted.createdAt,
            lastMessage: null,
          },
        ],
      },
    })
    await setupAuthenticatedSession(page)
    await page.context().addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
      { name: "vestio_locale", value: locale, domain: "localhost", path: "/" },
    ])
    await page.goto("/")
    const bell = page
      .getByRole("button", {
        name: locale === "fr" ? /^Notifications,/ : /^الإشعارات،/,
      })
      .filter({ visible: true })
    await expect(bell).toBeVisible()
    await bell.click()
    const amount = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "code",
    }).format(125.5)
    const text =
      locale === "fr"
        ? `Votre offre de ${amount} pour « Veste en jean » a été acceptée par Alex Owner.`
        : `وافق Alex Owner على عرضك بقيمة ${amount} للمنتج «Veste en jean».`
    await expect(page.getByText(text, { exact: true })).toBeVisible()
    const row = page.getByRole("listitem").filter({ hasText: text })
    const link = row.getByRole("button", {
      name: locale === "fr" ? "Ouvrir la conversation" : "فتح المحادثة",
      exact: true,
    })
    await expect(link).toBeVisible()
    await expect(
      page.getByRole("button", {
        name: locale === "fr" ? "Voir l’offre" : "عرض العرض",
        exact: true,
      }),
    ).toHaveCount(1)
    const fallback = page.getByRole("listitem").filter({
      hasText:
        locale === "fr"
          ? "Nouvelle activité sur votre compte."
          : "نشاط جديد على حسابك.",
    })
    await expect(fallback).toHaveCount(1)
    await expect(fallback.getByRole("link")).toHaveCount(0)
    await expect(
      fallback.getByRole("button", {
        name: locale === "fr" ? "Ouvrir la conversation" : "فتح المحادثة",
        exact: true,
      }),
    ).toHaveCount(0)
    await link.click()
    await expect(page).toHaveURL(/\/$/)
    const chatDialog = page.getByRole("dialog", {
      name: locale === "fr" ? "Messages" : "الرسائل",
      exact: true,
    })
    await expect(chatDialog).toBeVisible()
    await expect(
      chatDialog
        .getByRole("region", {
          name: locale === "fr" ? "Conversation" : "المحادثة",
          exact: true,
        })
        .getByText(accepted.payload.listingTitle, { exact: true }),
    ).toBeVisible()
    await expect
      .poll(async () => {
        const data = await (
          await request.get(`${api}/api/notifications?size=100`, { headers })
        ).json()
        return Boolean(
          data.items.find((item: { id: string }) => item.id === accepted.id)
            ?.readAt,
        )
      })
      .toBe(true)
  })
}

for (const locale of ["fr", "ar"] as const) {
  test(`owners can accept and refuse pending received offers (${locale})`, async ({
    page,
    request,
  }) => {
    const token = `notification-test-${randomUUID()}`
    const headers = { Authorization: `Bearer ${token}` }
    const item = (
      title: string,
      status = "PENDING",
      direction = "received",
    ) => ({
      direction,
      listingTitle: title,
      listingStatus: "AVAILABLE",
      listingDeliveryTypes: ["MEETUP"],
      offer: {
        id: randomUUID(),
        listingId: randomUUID(),
        price: 125.5,
        deliveryTypes: ["MEETUP"],
        message: "Can we meet?",
        status,
        createdAt: new Date().toISOString(),
      },
    })
    const items = [
      item("Accept this shirt"),
      item("Refuse this shirt"),
      item("Already accepted", "ACCEPTED"),
      item("Already refused", "REFUSED"),
      item("Sent pending", "PENDING", "sent"),
    ]
    expect(
      (
        await request.post(`${api}/__test/offers`, {
          headers,
          data: { items, delay: 500 },
        })
      ).ok(),
    ).toBeTruthy()
    await setupAuthenticatedSession(page)
    await page.context().addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
      { name: "vestio_locale", value: locale, domain: "localhost", path: "/" },
    ])
    await page.goto("/")
    await page
      .locator("[data-offers-trigger]")
      .filter({ visible: true })
      .click()
    const labels =
      locale === "fr"
        ? {
            accept: "Accepter l’offre",
            refuse: "Refuser l’offre",
            accepted: "Acceptée",
            refused: "Refusée",
          }
        : {
            accept: "قبول العرض",
            refuse: "رفض العرض",
            accepted: "مقبول",
            refused: "مرفوض",
          }
    const row = (title: string) => page.getByRole("listitem").filter({
        has: page.getByRole("heading", { name: title, exact: true }),
      })
    for (const [title, action, finalStatus] of [
      ["Accept this shirt", labels.accept, labels.accepted],
      ["Refuse this shirt", labels.refuse, labels.refused],
    ]) {
      await row(title)
        .getByRole("button", { name: action, exact: true })
        .click()
      await expect(
        row(title).getByRole("button", { name: labels.accept, exact: true }),
      ).toBeDisabled()
      await expect(
        row(title).getByRole("button", { name: labels.refuse, exact: true }),
      ).toBeDisabled()
      await expect(
        row(title).getByText(finalStatus, { exact: true }),
      ).toBeVisible()
      await expect(row(title).getByRole("group")).toHaveCount(0)
    }
    for (const title of ["Already accepted", "Already refused"]) {
      await expect(row(title)).toBeVisible()
      await expect(row(title).getByRole("group")).toHaveCount(0)
    }
    const state = await (
      await request.get(`${api}/__test/offers`, { headers })
    ).json()
    expect(state.calls.map((call: { action: string }) => call.action)).toEqual([
      "accept",
      "refuse",
    ])
    expect(
      state.calls.map((call: { offerId: string }) => call.offerId),
    ).toEqual([items[0].offer.id, items[1].offer.id])
    await page.reload()
    await expect(page.locator("dialog[data-offers-panel]")).toBeVisible()
    await expect(
      row("Accept this shirt").getByText(labels.accepted, { exact: true }),
    ).toBeVisible()
    await expect(
      row("Refuse this shirt").getByText(labels.refused, { exact: true }),
    ).toBeVisible()
    await page
      .locator("dialog[data-offers-panel]")
      .getByRole("navigation")
      .getByRole("button", {
        name: locale === "fr" ? "Offres envoyées" : "العروض المرسلة",
        exact: true,
      })
      .click()
    await expect(row("Sent pending")).toBeVisible()
    await expect(
      page.getByRole("button", { name: labels.accept, exact: true }),
    ).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: labels.refuse, exact: true }),
    ).toHaveCount(0)
  })
}

test("owner actions recover from a failed request and refresh stale decisions", async ({
  page,
  request,
}) => {
  const token = `notification-test-${randomUUID()}`
  const headers = { Authorization: `Bearer ${token}` }
  const offer = {
    id: randomUUID(),
    listingId: randomUUID(),
    price: 50,
    deliveryTypes: ["MEETUP"],
    message: "Hello",
    status: "PENDING",
    createdAt: new Date().toISOString(),
  }
  const item = {
    offer,
    listingTitle: "Retry shirt",
    listingStatus: "AVAILABLE",
  }
  const seed = async (options: object) =>
    expect(
      (
        await request.post(`${api}/__test/offers`, {
          headers,
          data: { items: [item], ...options },
        })
      ).ok(),
    ).toBeTruthy()
  await seed({ failNext: true })
  await setupAuthenticatedSession(page)
  await page
    .context()
    .addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
    ])
  await page.goto("/")
  await page.locator("[data-offers-trigger]").filter({ visible: true }).click()
  await page
    .getByRole("button", { name: "Accepter l’offre", exact: true })
    .click()
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: "Retry shirt" })
      .getByRole("alert"),
  ).toHaveText("Impossible d’accepter l’offre. Réessayez.")
  await expect(
    page.getByRole("button", { name: "Accepter l’offre", exact: true }),
  ).toBeEnabled()
  await expect(
    page.getByRole("button", { name: "Refuser l’offre", exact: true }),
  ).toBeEnabled()
  await page
    .getByRole("button", { name: "Accepter l’offre", exact: true })
    .click()
  await expect(page.getByText("Acceptée", { exact: true })).toBeVisible()
  expect(
    (await (await request.get(`${api}/__test/offers`, { headers })).json())
      .calls,
  ).toHaveLength(2)
  await seed({ staleNext: true })
  await page.reload()
  await expect(page.locator("dialog[data-offers-panel]")).toBeVisible()
  await page
    .getByRole("button", { name: "Refuser l’offre", exact: true })
    .click()
  await expect(page.getByText("Acceptée", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Refuser l’offre", exact: true }),
  ).toHaveCount(0)
})

for (const locale of ["fr", "ar"] as const) {
  test(`typed chat events, system messages, sending and reconnect work in ${locale}`, async ({
    page,
    request,
  }) => {
    test.skip(
      !process.env.NEXT_PUBLIC_APPSYNC_EVENTS_HTTP_ENDPOINT,
      "Requires AppSync endpoints",
    )
    const userId = randomUUID()
    const ownerId = randomUUID()
    const token = `notification-test-${randomUUID()}`
    const headers = { Authorization: `Bearer ${token}` }
    const chat = {
      id: randomUUID(),
      offerId: randomUUID(),
      listingId: randomUUID(),
      listingTitle: "Veste en jean",
      listingCoverAssetKey: randomUUID(),
      ownerId,
      ownerName: "Alex Owner",
      buyerId: userId,
      buyerName: "Sara Benali",
      createdAt: "2026-11-20T10:00:00Z",
      lastMessage: null,
    }
    const other = {
      ...chat,
      id: randomUUID(),
      offerId: randomUUID(),
      listingId: randomUUID(),
      listingTitle: "Other listing",
      listingCoverAssetKey: randomUUID(),
      createdAt: "2026-11-20T12:00:00Z",
    }
    const system = {
      id: randomUUID(),
      chatId: chat.id,
      senderId: null,
      content: null,
      system: true,
      systemType: "offer-accepted",
      params: {
        offerId: chat.offerId,
        chatId: chat.id,
        amount: 125.5,
        currency: "MAD",
        ownerName: chat.ownerName,
        buyerName: chat.buyerName,
        listingTitle: chat.listingTitle,
      },
      createdAt: "2026-11-20T11:00:00Z",
    }
    const messages: unknown[] = [system]
    const seed = async (failNext = false) => {
      expect(
        (
          await request.post(`${api}/__test/chats`, {
            headers,
            data: {
              chats: [chat, other],
              messages,
              senderId: userId,
              failNext,
            },
          })
        ).ok(),
      ).toBeTruthy()
    }
    await seed(true)
    const claims = Buffer.from(
      JSON.stringify({
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url")
    await page.route("**/api/auth/realtime", (route) =>
      route.fulfill({ json: { accessToken: `test.${claims}.signature` } }),
    )
    let socket: WebSocketRoute | undefined
    let subscription: string | undefined
    let subscriptions = 0
    const warnings: string[] = []
    page.on("console", (message) => warnings.push(message.text()))
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
          if (message.channel === `/chat/${userId}`) {
            subscription = message.id
            subscriptions++
          }
          ws.send(JSON.stringify({ type: "subscribe_success", id: message.id }))
        }
      })
    })
    const emit = (message: unknown, id: string) =>
      socket!.send(
        JSON.stringify({
          type: "data",
          id: subscription,
          event: [
            JSON.stringify({
              id,
              type: "chat",
              occurredAt: new Date().toISOString(),
              payload: message,
            }),
          ],
        }),
      )
    await setupAuthenticatedSession(page)
    await page.context().addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
      { name: "vestio_locale", value: locale, domain: "localhost", path: "/" },
    ])
    await page.route("https://*.s3.ca-central-1.amazonaws.com/**", (route) => {
      if (route.request().url().includes(other.listingCoverAssetKey))
        return route.fulfill({ status: 404 })
      return route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="150"><rect width="120" height="150" fill="#c4cddd"/><path d="m38 35-20 22 16 18 8-9v65h38V66l8 9 16-18-20-22-14 9H52Z" fill="#3f6689"/></svg>',
      })
    })
    await page.goto(`/chats/${chat.id}`)
    await expect.poll(() => subscription).toBeDefined()
    const history = page.getByRole("region", {
      name: locale === "fr" ? "Historique des messages" : "سجل الرسائل",
    })
    await expect(history.getByText(/Alex Owner.*Sara Benali/)).toBeVisible()
    const sidebar = page.getByRole("complementary", {
      name: locale === "fr" ? "Messages" : "الرسائل",
      exact: true,
    })
    const conversation = page.getByRole("region", {
      name: locale === "fr" ? "Conversation" : "المحادثة",
      exact: true,
    })
    const nav = sidebar.getByRole("navigation")
    await expect(sidebar).toBeVisible()
    await expect(conversation).toBeVisible()
    const listBox = await sidebar.boundingBox()
    const conversationBox = await conversation.boundingBox()
    expect(
      locale === "fr"
        ? listBox!.x < conversationBox!.x
        : listBox!.x > conversationBox!.x,
    ).toBeTruthy()
    const currentLink = nav.getByRole("link", {
      name: new RegExp(chat.listingTitle),
    })
    await expect(currentLink).toHaveAttribute("aria-current", "page")
    await expect(
      currentLink.getByRole("img", { name: chat.listingTitle }),
    ).toHaveAttribute(
      "src",
      new RegExp(`${chat.listingCoverAssetKey}_thumbnail.webp`),
    )
    await expect(
      nav.getByRole("img", {
        name: locale === "fr" ? "Photo non disponible" : "الصورة غير متوفرة",
      }),
    ).toBeVisible()
    const textbox = page.getByRole("textbox", {
      name: locale === "fr" ? "Votre message" : "رسالتك",
    })
    const send = page.getByRole("button", {
      name: locale === "fr" ? "Envoyer" : "إرسال",
      exact: true,
    })
    await textbox.fill("Hello from buyer")
    await send.click()
    await expect(history.getByRole("alert")).toContainText(
      locale === "fr" ? "Impossible d’envoyer" : "تعذّر إرسال",
    )
    await expect(textbox).toHaveValue("Hello from buyer")
    await textbox.press("Shift+Enter")
    await expect(textbox).toHaveValue("Hello from buyer\n")
    await textbox.press("Backspace")
    await textbox.press("Enter")
    await expect(
      history.getByText("Hello from buyer", { exact: true }),
    ).toHaveCount(1)
    await expect(textbox).toHaveValue("")
    const saved = await (
      await request.get(`${api}/__test/chats`, { headers })
    ).json()
    expect(saved.calls).toEqual([
      { content: "Hello from buyer" },
      { content: "Hello from buyer" },
    ])
    messages.splice(0, messages.length, ...saved.messages)
    const incoming = {
      id: randomUUID(),
      chatId: chat.id,
      senderId: ownerId,
      content: "Live owner reply",
      system: false,
      systemType: null,
      params: null,
      createdAt: new Date().toISOString(),
    }
    messages.push(incoming)
    await seed()
    emit(incoming, randomUUID()) // Invalid envelope/message ID pairing must be ignored.
    await expect
      .poll(() => warnings.some((text) => text.includes("APPSYNC_CHAT")))
      .toBeTruthy()
    await expect(
      history.getByText(incoming.content, { exact: true }),
    ).toHaveCount(0)
    emit(incoming, incoming.id)
    emit(incoming, incoming.id)
    await expect(
      history.getByText(incoming.content, { exact: true }),
    ).toHaveCount(1)
    const offline = {
      ...incoming,
      id: randomUUID(),
      content: "Saved while disconnected",
      createdAt: new Date(Date.now() + 1000).toISOString(),
    }
    messages.push(offline)
    await seed()
    const before = subscriptions
    socket!.close({ code: 1001, reason: "Reconnect chat test" })
    await expect.poll(() => subscriptions).toBeGreaterThan(before)
    await expect(
      history.getByText(offline.content, { exact: true }),
    ).toBeVisible()
    const liveGroup = history
      .getByText(incoming.content, { exact: true })
      .locator("xpath=ancestor::li[1]")
    await expect(liveGroup).toContainText(offline.content)
    await expect(
      liveGroup.getByText("Alex Owner", { exact: true }),
    ).toHaveCount(1)
    await expect(liveGroup.locator("time")).toHaveCount(1)
    await expect(
      history.getByText("Hello from buyer", { exact: true }).locator(".."),
    ).toHaveClass(/bg-primary/)
    await page.screenshot({
      path: `/tmp/vestio-messenger-${locale}-desktop.png`,
    })
    const screenIdentity = randomUUID()
    await sidebar.evaluate((element, marker) => {
      element.dataset.screenIdentity = marker
    }, screenIdentity)
    const header = page.locator("header").first()
    await header.evaluate((element, marker) => {
      element.dataset.screenIdentity = marker
    }, screenIdentity)
    const navigations: string[] = []
    page.on("request", (request) => {
      if (
        request.resourceType() === "document" ||
        (request.method() === "GET" &&
          new URL(request.url()).pathname.startsWith("/chats") &&
          request.headers().rsc &&
          !request.headers()["next-router-prefetch"])
      )
        navigations.push(request.url())
    })
    await nav.getByRole("link", { name: /Other listing/ }).click()
    await expect(page).toHaveURL(new RegExp(`/chats/${other.id}$`))
    await expect(
      conversation.getByText("Other listing", { exact: true }),
    ).toBeVisible()
    await expect(
      history.getByText(offline.content, { exact: true }),
    ).toHaveCount(0)
    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`/chats/${chat.id}$`))
    await expect(
      history.getByText(offline.content, { exact: true }),
    ).toBeVisible()
    await page.goForward()
    await expect(page).toHaveURL(new RegExp(`/chats/${other.id}$`))
    await expect(
      conversation.getByText("Other listing", { exact: true }),
    ).toBeVisible()
    await nav.getByRole("link", { name: new RegExp(chat.listingTitle) }).click()
    await expect(
      history.getByText(offline.content, { exact: true }),
    ).toBeVisible()
    await expect(sidebar).toHaveAttribute(
      "data-screen-identity",
      screenIdentity,
    )
    await expect(header).toHaveAttribute("data-screen-identity", screenIdentity)
    const historyLength = await page.evaluate(() => window.history.length)
    await nav.getByRole("link", { name: new RegExp(chat.listingTitle) }).click()
    expect(await page.evaluate(() => window.history.length)).toBe(historyLength)
    expect(navigations).toEqual([])
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(sidebar).toBeHidden()
    await expect(conversation).toBeVisible()
    await page.screenshot({
      path: `/tmp/vestio-messenger-${locale}-mobile.png`,
    })
    const composerBox = await textbox.boundingBox()
    expect(composerBox!.y + composerBox!.height).toBeLessThanOrEqual(844)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy()
    await page
      .getByRole("link", {
        name: locale === "fr" ? "Toutes les conversations" : "جميع المحادثات",
        exact: true,
      })
      .click()
    await expect(sidebar).toBeVisible()
    await expect(conversation).toHaveCount(0)
    await expect(page.locator("main li").first()).toContainText(
      chat.listingTitle,
    )
    await expect(page.locator("main li").first()).toContainText(offline.content)
  })
}

for (const locale of ["fr", "ar"] as const) {
  test(`live badges and eight-second popups deduplicate, clear on viewing, and isolate sessions (${locale})`, async ({
    page,
    request,
  }) => {
    test.skip(
      !process.env.NEXT_PUBLIC_APPSYNC_EVENTS_HTTP_ENDPOINT,
      "Requires AppSync endpoints",
    )
    const userId = randomUUID()
    const ownerId = randomUUID()
    let realtimeUserId = userId
    const token = `notification-test-${randomUUID()}`
    const headers = { Authorization: `Bearer ${token}` }
    const chat = {
      id: randomUUID(),
      offerId: randomUUID(),
      listingId: randomUUID(),
      listingTitle: "My jacket",
      listingCoverAssetKey: null,
      ownerId,
      ownerName: "Alex",
      buyerId: userId,
      buyerName: "Sara",
      createdAt: new Date().toISOString(),
      lastMessage: null,
    }
    const other = {
      ...chat,
      id: randomUUID(),
      listingId: randomUUID(),
      offerId: randomUUID(),
      listingTitle: "Other jacket",
    }
    const messages: unknown[] = []
    const notifications: unknown[] = []
    const seed = async () => {
      expect(
        (
          await request.post(`${api}/__test/chats`, {
            headers,
            data: { chats: [chat, other], messages, senderId: userId },
          })
        ).ok(),
      ).toBeTruthy()
      expect(
        (
          await request.post(`${api}/__test/notifications`, {
            headers,
            data: notifications,
          })
        ).ok(),
      ).toBeTruthy()
    }
    await seed()
    await page.route("**/api/auth/realtime", (route) => {
      const claims = Buffer.from(
        JSON.stringify({
          sub: realtimeUserId,
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString("base64url")
      return route.fulfill({
        json: { accessToken: `test.${claims}.signature` },
      })
    })
    let socket: WebSocketRoute | undefined
    const subscriptions = new Map<string, string>()
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
          subscriptions.set(message.channel, message.id)
          ws.send(JSON.stringify({ type: "subscribe_success", id: message.id }))
        }
      })
    })
    const emit = (kind: "chat" | "notification", item: { id: string }) =>
      socket!.send(
        JSON.stringify({
          type: "data",
          id: subscriptions.get(
            `/${kind === "chat" ? "chat" : "notifications"}/${realtimeUserId}`,
          ),
          event: [
            JSON.stringify({
              id: item.id,
              type: kind,
              occurredAt: new Date().toISOString(),
              payload: item,
            }),
          ],
        }),
      )
    await setupAuthenticatedSession(page)
    await page.context().addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
      { name: "vestio_locale", value: locale, domain: "localhost", path: "/" },
    ])
    await page.goto("/chats")
    await expect.poll(() => subscriptions.size).toBe(2)
    await expect(page.locator("[data-toast-kind]")).toHaveCount(0)
    await page.clock.install()
    await page.clock.pauseAt(new Date(Date.now() + 1000))
    const chatBadge = (count: number) =>
      page
        .getByRole("navigation", {
          name: locale === "fr" ? "Actions principales" : "الإجراءات الرئيسية",
        })
        .getByRole("link", {
          name:
            locale === "fr"
              ? `Messages, ${count} non lus`
              : `الرسائل، ${count} غير مقروءة`,
          exact: true,
        })
    const incoming = {
      id: randomUUID(),
      chatId: chat.id,
      senderId: ownerId,
      content: "Hello from Alex",
      system: false,
      systemType: null,
      params: null,
      createdAt: new Date().toISOString(),
    }
    messages.push(incoming)
    await seed()
    emit("chat", incoming)
    emit("chat", incoming)
    const toast = page.locator('[data-toast-kind="chat"]')
    await expect(chatBadge(1)).toBeVisible()
    await expect(toast).toHaveCount(1)
    await expect(toast).toContainText(incoming.content)
    const box = await toast.boundingBox()
    const viewport = page.viewportSize()!
    expect(viewport.width - box!.x - box!.width).toBeLessThanOrEqual(20)
    expect(viewport.height - box!.y - box!.height).toBeLessThanOrEqual(20)
    await page.clock.fastForward(4000)
    await toast.hover()
    await page.clock.fastForward(10000)
    await expect(toast).toBeVisible()
    await page.mouse.move(0, 0)
    await page.clock.fastForward(3999)
    await expect(toast).toBeVisible()
    await page.clock.fastForward(1)
    await expect(toast).toHaveCount(0)
    // Reading the toast does not consume the unread message itself.
    await expect(chatBadge(1)).toBeVisible()
    const own = {
      ...incoming,
      id: randomUUID(),
      senderId: userId,
      content: "My own reply",
    }
    messages.push(own)
    await seed()
    emit("chat", own)
    await expect(chatBadge(1)).toBeVisible()
    await expect(toast).toHaveCount(0)
    const second = {
      ...incoming,
      id: randomUUID(),
      chatId: other.id,
      content: "Hello in another chat",
    }
    messages.push(second)
    await seed()
    emit("chat", second)
    await expect(chatBadge(2)).toBeVisible()
    await toast.getByRole("button").click()
    await expect(toast).toHaveCount(0)
    await page.reload()
    await expect(chatBadge(2)).toBeVisible()
    await expect(page.locator("[data-toast-kind]")).toHaveCount(0)
    await page
      .getByRole("navigation", {
        name: locale === "fr" ? "Discussions" : "المحادثات",
        exact: true,
      })
      .getByRole("link", { name: /My jacket/ })
      .click()
    await expect(
      page.getByRole("region", {
        name: locale === "fr" ? "Historique des messages" : "سجل الرسائل",
      }),
    ).toContainText(incoming.content)
    await expect(chatBadge(1)).toBeVisible()
    const active = {
      ...incoming,
      id: randomUUID(),
      content: "Already reading this chat",
    }
    messages.push(active)
    await seed()
    emit("chat", active)
    await expect(toast).toContainText(active.content)
    await expect(chatBadge(1)).toBeVisible()
    await toast.getByRole("button").click()
    const notification = {
      id: randomUUID(),
      userId,
      type: "offer-accepted",
      listingId: chat.listingId,
      readAt: null,
      createdAt: new Date().toISOString(),
      payload: {
        chatId: chat.id,
        offerId: chat.offerId,
        amount: 100,
        currency: "MAD",
        ownerName: "Alex",
        buyerName: "Sara",
        listingTitle: "My jacket",
      },
    }
    notifications.push(notification)
    await seed()
    emit("notification", notification)
    emit("notification", notification)
    const notificationToast = page.locator('[data-toast-kind="notification"]')
    await expect(notificationToast).toHaveCount(1)
    const bell = (count: number) =>
      page.getByRole("button", {
        name:
          locale === "fr"
            ? `Notifications, ${count} non lues`
            : `الإشعارات، ${count} غير مقروءة`,
        exact: true,
      })
    await expect(bell(1)).toBeVisible()
    await page.screenshot({ path: `/tmp/vestio-event-popup-${locale}.png` })
    await notificationToast.getByRole("link").click()
    await expect(notificationToast).toHaveCount(0)
    await expect(bell(0)).toBeVisible()
    emit("notification", notification)
    await expect(notificationToast).toHaveCount(0)
    const pending = {
      ...second,
      id: randomUUID(),
      content: "Clear me on logout",
    }
    emit("chat", pending)
    await expect(toast).toBeVisible()
    await page.evaluate(() => {
      document.cookie = "vestio_authenticated=;path=/;max-age=0"
      window.dispatchEvent(new Event("vestio:auth-changed"))
    })
    await expect(page.locator("[data-toast-kind]")).toHaveCount(0)
    realtimeUserId = randomUUID()
    await page.context().addCookies([
      {
        name: "vestio_authenticated",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ])
    await page.evaluate(() =>
      window.dispatchEvent(new Event("vestio:auth-changed")),
    )
    await expect
      .poll(() => subscriptions.has(`/chat/${realtimeUserId}`))
      .toBeTruthy()
    await expect(
      page
        .getByRole("navigation", {
          name: locale === "fr" ? "Actions principales" : "الإجراءات الرئيسية",
        })
        .getByRole("link", {
          name: locale === "fr" ? "Messages" : "الرسائل",
          exact: true,
        }),
    ).toBeVisible()
    await expect(page.locator("[data-toast-kind]")).toHaveCount(0)
  })
}

test("newest three unique alerts replace the oldest without resetting existing timers", async ({
  page,
}) => {
  await setupAuthenticatedSession(page)
  await page.context().addCookies([
    {
      name: "vestio_token",
      value: `notification-test-${randomUUID()}`,
      domain: "localhost",
      path: "/",
    },
  ])
  await page.goto("/")
  await page.locator("[data-chat-trigger]").filter({ visible: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Messages", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText(
      "Vos conversations apparaîtront ici après l’acceptation d’une offre.",
      { exact: true },
    ),
  ).toBeVisible()
  await page.clock.install()
  await page.clock.pauseAt(new Date(Date.now() + 1000))
  const push = (messages: string[]) =>
    page.evaluate((items) => {
      for (const message of items)
        window.dispatchEvent(
          new CustomEvent("vestio:notification", {
            detail: { type: "info", message },
          }),
        )
    }, messages)
  await push(["Alert A", "Alert B", "Alert A", "Alert C", "Alert D", "Alert C"])
  const alerts = page.locator("[data-toast-kind]")
  await expect(alerts).toHaveCount(3)
  for (const [index, message] of ["Alert B", "Alert C", "Alert D"].entries())
    await expect(alerts.nth(index)).toContainText(message)
  await expect(alerts.filter({ hasText: "Alert A" })).toHaveCount(0)
  const boxes = await alerts.evaluateAll((items) =>
    items.map((item) => {
      const rect = item.getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom }
    }),
  )
  expect(boxes[1].top - boxes[0].bottom).toBe(6)
  expect(boxes[2].top - boxes[1].bottom).toBe(6)
  await page.screenshot({ path: "/tmp/vestio-three-alert-stack.png" })
  await page.clock.fastForward(4000)
  await push(["Alert E", "Alert C", "Alert E"])
  await expect(alerts).toHaveCount(3)
  for (const [index, message] of ["Alert C", "Alert D", "Alert E"].entries())
    await expect(alerts.nth(index)).toContainText(message)
  await expect(alerts.filter({ hasText: "Alert B" })).toHaveCount(0)
  await page.clock.fastForward(1000)
  await expect(alerts).toHaveCount(1)
  await expect(alerts).toContainText("Alert E")
  await page.clock.fastForward(3999)
  await expect(alerts).toHaveCount(1)
  await page.clock.fastForward(1)
  await expect(alerts).toHaveCount(0)
})

for (const locale of ["fr", "ar"] as const) {
  test(`consecutive messages share a sender and timestamp but keep separate bubbles (${locale})`, async ({
    page,
    request,
  }) => {
    const buyerId = randomUUID()
    const ownerId = randomUUID()
    const token = `notification-test-${randomUUID()}`
    const chat = {
      id: randomUUID(),
      offerId: randomUUID(),
      listingId: randomUUID(),
      listingTitle: "Grouped conversation",
      listingCoverAssetKey: null,
      ownerId,
      ownerName: "Alex Owner",
      buyerId,
      buyerName: "Sara Buyer",
      createdAt: "2026-11-20T09:00:00Z",
      lastMessage: null,
    }
    const regular = (content: string, time: string, senderId = ownerId) => ({
      id: randomUUID(),
      chatId: chat.id,
      senderId,
      content,
      system: false,
      systemType: null,
      params: null,
      createdAt: `2026-11-20T${time}Z`,
    })
    const messages = [
      regular("First from owner", "09:00:00.000"),
      regular("Second from owner", "09:05:00.000"),
      regular("Exactly ten minutes", "09:10:00.000"),
      regular("Past ten minutes", "09:10:00.001"),
      regular("Buyer interrupts", "09:11:00.000", buyerId),
      regular("Second from buyer", "09:11:30.000", buyerId),
      regular("Owner after buyer", "09:12:00.000"),
      {
        id: randomUUID(),
        chatId: chat.id,
        senderId: null,
        content: null,
        system: true,
        systemType: "offer-accepted",
        params: {
          offerId: chat.offerId,
          chatId: chat.id,
          amount: 100,
          currency: "MAD",
          ownerName: "Alex Owner",
          buyerName: "Sara Buyer",
          listingTitle: chat.listingTitle,
        },
        createdAt: "2026-11-20T09:13:00.000Z",
      },
      regular("Owner after system", "09:14:00.000"),
      regular("Same group after system", "09:15:00.000"),
      regular("Another ten-minute window", "09:24:00.001"),
    ]
    expect(
      (
        await request.post(`${api}/__test/chats`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { chats: [chat], messages, senderId: buyerId },
        })
      ).ok(),
    ).toBeTruthy()
    await setupAuthenticatedSession(page)
    await page.context().addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
      { name: "vestio_locale", value: locale, domain: "localhost", path: "/" },
    ])
    await page.goto("/")
    await page.locator("[data-chat-trigger]").filter({ visible: true }).click()
    await page
      .getByRole("navigation", {
        name: locale === "fr" ? "Discussions" : "المحادثات",
        exact: true,
      })
      .getByRole("button", { name: new RegExp(chat.listingTitle) })
      .click()
    const history = page.getByRole("region", {
      name: locale === "fr" ? "Historique des messages" : "سجل الرسائل",
    })
    const groups = history.locator("ol > li")
    await expect(groups).toHaveCount(7)
    for (const [index, contents] of [
      ["First from owner", "Second from owner", "Exactly ten minutes"],
      ["Past ten minutes"],
      ["Buyer interrupts", "Second from buyer"],
      ["Owner after buyer"],
      ["Alex Owner", "Sara Buyer", "Grouped conversation"],
      ["Owner after system", "Same group after system"],
      ["Another ten-minute window"],
    ].entries()) {
      for (const text of contents)
        await expect(groups.nth(index)).toContainText(text)
      await expect(groups.nth(index).locator("time")).toHaveCount(1)
    }
    await expect(
      groups.nth(0).getByText("Alex Owner", { exact: true }),
    ).toHaveCount(1)
    for (const [index, count] of [3, 1, 2, 1, 0, 2, 1].entries()) {
      await expect(groups.nth(index).locator("div.rounded-2xl")).toHaveCount(
        count,
      )
    }
    for (const text of ["Buyer interrupts", "Second from buyer"]) {
      await expect(
        groups.nth(2).getByText(text, { exact: true }).locator(".."),
      ).toHaveClass(/bg-primary/)
    }
    await expect(groups.nth(0).locator("time")).toHaveAttribute(
      "datetime",
      "2026-11-20T09:10:00.000Z",
    )
    await expect(
      groups.nth(5).getByText("Alex Owner", { exact: true }),
    ).toHaveCount(1)
    await expect(groups.nth(5).locator("time")).toHaveAttribute(
      "datetime",
      "2026-11-20T09:15:00.000Z",
    )
    await expect(
      groups.nth(2).getByText("Alex Owner", { exact: true }),
    ).toHaveCount(0)
    await expect(history.getByText("Alex Owner", { exact: true })).toHaveCount(
      5,
    )
    await history
      .locator(":scope > div")
      .first()
      .evaluate((element) => {
        element.scrollTop = 0
      })
    await page.screenshot({ path: `/tmp/vestio-grouped-chat-${locale}.png` })
  })
}

test.describe("chat calendar-day labels", () => {
  test.use({ timezoneId: "America/Toronto" })
  for (const locale of ["fr", "ar"] as const) {
    test(`gray chat rows with edge spacing and local today/yesterday/date timestamps (${locale})`, async ({
      page,
      request,
    }) => {
      await page.clock.install({ time: new Date("2026-11-02T04:29:59Z") })
      await page.clock.pauseAt(new Date("2026-11-02T04:30:00Z")) // Nov 1, 23:30 after DST fallback.
      await page.route("**/api/auth/realtime", (route) =>
        route.fulfill({ status: 401 }),
      )
      const token = `notification-test-${randomUUID()}`
      const userId = randomUUID()
      const ownerId = randomUUID()
      const today = locale === "fr" ? "Aujourd’hui" : "اليوم"
      const yesterday = locale === "fr" ? "Hier" : "أمس"
      const cases = [
        {
          title: "Recent message",
          dateTime: "2026-11-02T04:15:00Z",
          label: today,
        },
        {
          title: "Previous day",
          dateTime: "2026-11-01T03:30:00Z",
          label: yesterday,
        },
        {
          title: "Four days earlier",
          dateTime: "2026-10-29T03:30:00Z",
          label: new Intl.RelativeTimeFormat(locale, {
            numeric: "always",
          }).format(-4, "day"),
        },
        {
          title: "Same long local day",
          dateTime: "2026-11-01T04:15:00Z",
          label: today,
        }, // >24h ago, still the same local day.
      ]
      const chats = cases.map((item) => ({
        id: randomUUID(),
        offerId: randomUUID(),
        listingId: randomUUID(),
        listingTitle: item.title,
        listingCoverAssetKey: null,
        ownerId,
        ownerName: "Alex Owner",
        buyerId: userId,
        buyerName: "Sara Buyer",
        createdAt: item.dateTime,
        lastMessage: null,
      }))
      const messages = chats.map((chat, index) => ({
        id: randomUUID(),
        chatId: chat.id,
        senderId: ownerId,
        content: `Message ${cases[index].title}`,
        system: false,
        systemType: null,
        params: null,
        createdAt: cases[index].dateTime,
      }))
      expect(
        (
          await request.post(`${api}/__test/chats`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { chats, messages, senderId: userId },
          })
        ).ok(),
      ).toBeTruthy()
      await setupAuthenticatedSession(page)
      await page.context().addCookies([
        { name: "vestio_token", value: token, domain: "localhost", path: "/" },
        {
          name: "vestio_locale",
          value: locale,
          domain: "localhost",
          path: "/",
        },
      ])
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      await page.goto("/")
      await page
        .locator("[data-chat-trigger]")
        .filter({ visible: true })
        .click()
      const nav = page.getByRole("navigation", {
        name: locale === "fr" ? "Discussions" : "المحادثات",
        exact: true,
      })
      const history = page.getByRole("region", {
        name: locale === "fr" ? "Historique des messages" : "سجل الرسائل",
        exact: true,
      })
      const at = (day: string, time: string) =>
        locale === "fr" ? `${day} à ${time}` : `${day} الساعة ${time}`
      const clock = (dateTime: string) =>
        new Intl.DateTimeFormat(locale, {
          timeZone: "America/Toronto",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }).format(new Date(dateTime))
      for (const item of cases) {
        const row = nav.getByRole("button", { name: new RegExp(item.title) })
        await expect(row.locator("time")).toHaveText(item.label)
        await expect(row.locator("time")).toHaveAttribute(
          "datetime",
          item.dateTime,
        )
        await row.click()
        const parts = new Intl.DateTimeFormat(locale, {
          timeZone: "America/Toronto",
          day: "2-digit",
          month: "2-digit",
          calendar: "gregory",
        }).formatToParts(new Date(item.dateTime))
        const date = `${parts.find((part) => part.type === "day")!.value}/${parts.find((part) => part.type === "month")!.value}`
        const label =
          item.label === today || item.label === yesterday ? item.label : date
        await expect(history.locator("time")).toHaveText(
          at(label, clock(item.dateTime)),
        )
        await expect(row).toHaveClass(/bg-primary\/5/)
        const geometry = await row.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            width: element.getBoundingClientRect().width,
            available: element.closest("nav")!.clientWidth,
            padding: [
              style.paddingTop,
              style.paddingRight,
              style.paddingBottom,
              style.paddingLeft,
            ],
            radius: style.borderRadius,
          }
        })
        expect(
          Math.abs(geometry.width - geometry.available),
        ).toBeLessThanOrEqual(1)
        expect(geometry.padding).toEqual(
          locale === "fr"
            ? ["12px", "12px", "12px", "16px"]
            : ["12px", "16px", "12px", "12px"],
        )
        expect(geometry.radius).toBe("0px")
      }
      await expect(nav.locator("ul")).toHaveCSS("padding-top", "12px")
      await expect(nav.locator("ul")).toHaveCSS("padding-bottom", "12px")
      await nav.getByRole("button", { name: /Recent message/ }).click()
      await expect(history.locator("time")).toHaveText(
        at(today, clock(cases[0].dateTime)),
      )
      await page.screenshot({ path: `/tmp/vestio-chat-dates-${locale}.png` })
      await page.clock.fastForward(31 * 60 * 1000) // Local midnight changes Today to Yesterday.
      await expect(
        nav.getByRole("button", { name: /Recent message/ }).locator("time"),
      ).toHaveText(yesterday)
      await expect(history.locator("time")).toHaveText(
        at(yesterday, clock(cases[0].dateTime)),
      )
      expect(errors).toEqual([])
    })
  }
})

for (const locale of ["fr", "ar"] as const) {
  test(`chat slides over the current page with history, focus, alerts and mobile navigation (${locale})`, async ({
    page,
    request,
  }) => {
    const token = `notification-test-${randomUUID()}`
    const userId = randomUUID()
    const ownerId = randomUUID()
    const chat = {
      id: randomUUID(),
      offerId: randomUUID(),
      listingId: randomUUID(),
      listingTitle: "Drawer jacket",
      listingCoverAssetKey: null,
      ownerId,
      ownerName: "Alex Owner",
      buyerId: userId,
      buyerName: "Sara Buyer",
      createdAt: new Date().toISOString(),
      lastMessage: null,
    }
    const other = {
      ...chat,
      id: randomUUID(),
      offerId: randomUUID(),
      listingId: randomUUID(),
      listingTitle: "Drawer shoes",
    }
    const messages = [chat, other].map((item) => ({
      id: randomUUID(),
      chatId: item.id,
      senderId: ownerId,
      content: `Hello about ${item.listingTitle}`,
      system: false,
      systemType: null,
      params: null,
      createdAt: new Date().toISOString(),
    }))
    expect(
      (
        await request.post(`${api}/__test/chats`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { chats: [chat, other], messages, senderId: userId },
        })
      ).ok(),
    ).toBeTruthy()
    await setupAuthenticatedSession(page)
    await page.context().addCookies([
      { name: "vestio_token", value: token, domain: "localhost", path: "/" },
      { name: "vestio_locale", value: locale, domain: "localhost", path: "/" },
    ])
    await page.route("**/api/auth/realtime", (route) =>
      route.fulfill({ status: 401 }),
    )
    await page.goto("/search?query=drawer")
    const backgroundUrl = page.url()
    const background = page.locator("main#shop").filter({ visible: true })
    await expect(background.getByRole("heading", { level: 1 })).toContainText(
      "drawer",
    )
    await background.evaluate((element) => {
      element.dataset.keepMounted = "drawer-background"
    })
    const trigger = page
      .locator("[data-chat-trigger]")
      .filter({ visible: true })
    await trigger.click()
    const dialog = page.getByRole("dialog", {
      name: locale === "fr" ? "Messages" : "الرسائل",
      exact: true,
    })
    const close = dialog.getByRole("button", {
      name: locale === "fr" ? "Fermer les messages" : "إغلاق الرسائل",
      exact: true,
    })
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveCSS("transform", "none")
    await expect(close).toBeFocused()
    await expect(page).toHaveURL(backgroundUrl)
    expect(
      await page.evaluate(() => document.documentElement.style.overflow),
    ).toBe("hidden")
    const nav = dialog.getByRole("navigation", {
      name: locale === "fr" ? "Discussions" : "المحادثات",
      exact: true,
    })
    await nav.getByRole("button", { name: /Drawer jacket/ }).click()
    const history = dialog.getByRole("region", {
      name: locale === "fr" ? "Historique des messages" : "سجل الرسائل",
      exact: true,
    })
    await expect(history).toContainText("Hello about Drawer jacket")
    await dialog.getByRole("textbox").fill("Reply in the panel")
    await dialog
      .getByRole("button", {
        name: locale === "fr" ? "Envoyer" : "إرسال",
        exact: true,
      })
      .click()
    await expect(
      history.locator("ol").getByText("Reply in the panel", { exact: true }),
    ).toBeVisible()
    await expect(dialog.getByRole("textbox")).toHaveValue("")
    await expect(page).toHaveURL(backgroundUrl)
    await expect(background).toHaveAttribute(
      "data-keep-mounted",
      "drawer-background",
    )
    await page.screenshot({
      path: `/tmp/vestio-chat-drawer-${locale}-desktop.png`,
    })
    await nav.getByRole("button", { name: /Drawer shoes/ }).click()
    await expect(history).toContainText("Hello about Drawer shoes")
    await page.goBack()
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(backgroundUrl)
    await page.goForward()
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveCSS("transform", "none")
    await expect(history).toContainText("Hello about Drawer shoes")
    await page.evaluate(() =>
      window.dispatchEvent(
        new CustomEvent("vestio:notification", {
          detail: { type: "info", message: "Visible over the chat" },
        }),
      ),
    )
    const toast = dialog.locator('[data-toast-kind="info"]')
    await expect(toast).toContainText("Visible over the chat")
    await toast.evaluate((element) => {
      element.dataset.keepMounted = "drawer-toast"
    })
    await page.screenshot({
      path: `/tmp/vestio-chat-drawer-${locale}-alerts.png`,
    })
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
    expect(
      await page.evaluate(() => document.documentElement.style.overflow),
    ).toBe("")
    const restoredToast = page.locator('[data-toast-kind="info"]')
    await expect(restoredToast).toHaveAttribute(
      "data-keep-mounted",
      "drawer-toast",
    )
    await restoredToast.getByRole("button").click()
    await trigger.click()
    await expect(dialog).toHaveCSS("transform", "none")
    const bounds = await dialog.boundingBox()
    const width = page.viewportSize()!.width
    await page.mouse.click(
      bounds!.x > 0 ? bounds!.x / 2 : (bounds!.x + bounds!.width + width) / 2,
      250,
    )
    await expect(dialog).toHaveCount(0)
    await expect(page).toHaveURL(backgroundUrl)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.locator("#header-mobile-toggle").click()
    await page
      .locator("#header-mobile-menu")
      .getByRole("button", {
        name: locale === "fr" ? "Messages" : "الرسائل",
        exact: true,
      })
      .click()
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveCSS("transform", "none")
    expect((await dialog.boundingBox())!.width).toBe(390)
    await nav.getByRole("button", { name: /Drawer jacket/ }).click()
    await expect(history).toContainText("Reply in the panel")
    await page.screenshot({
      path: `/tmp/vestio-chat-drawer-${locale}-mobile.png`,
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy()
    await dialog
      .getByRole("button", {
        name: locale === "fr" ? "Toutes les conversations" : "جميع المحادثات",
        exact: true,
      })
      .click()
    await expect(nav).toBeVisible()
    await expect(history).toHaveCount(0)
    await close.click()
    await expect(dialog).toHaveCount(0)
    await expect(page.locator("#header-mobile-toggle")).toBeFocused()
    await expect(background).toHaveAttribute(
      "data-keep-mounted",
      "drawer-background",
    )
    await expect(page).toHaveURL(backgroundUrl)
  })
}
