import { expect, test } from "@playwright/test"
import { randomUUID } from "node:crypto"

for (const [locale, badge, message] of [
  [
    "en",
    "Refused",
    "was refused because an image violates our content policy.",
  ],
  [
    "fr",
    "Refusée",
    "a été refusé car une image enfreint notre politique de contenu.",
  ],
  ["ar", "مرفوض", "لأن إحدى صوره تخالف سياسة المحتوى."],
]) {
  test(`refusal notifications refresh the pending card and explain the refusal (${locale})`, async ({
    page,
    request,
  }) => {
    const token = `notification-test-${randomUUID()}`
    const headers = { Authorization: `Bearer ${token}` }
    const title = `Refusal-${randomUUID()}`
    const created = await request.post("http://localhost:8081/api/listings", {
      data: {
        title,
        status: "AWAITING_ASSETS",
        price: 100,
        cityIds: ["1"],
        categoryId: "c1",
      },
    })
    expect(created.ok()).toBeTruthy()
    const { id } = await created.json()
    try {
      await page.context().addCookies([
        {
          name: "vestio_locale",
          value: locale,
          domain: "localhost",
          path: "/",
        },
        {
          name: "vestio_authenticated",
          value: "1",
          domain: "localhost",
          path: "/",
        },
        { name: "vestio_token", value: token, domain: "localhost", path: "/" },
      ])
      await page.goto("/listings/pending")
      const card = page
        .getByRole("article")
        .filter({
          has: page.getByRole("heading", { name: title, exact: true }),
        })
      await expect(card).toBeVisible()
      await expect(card.getByText(badge, { exact: true })).toHaveCount(0)
      await request.put(`http://localhost:8081/api/listings/${id}`, {
        data: { status: "REJECTED_CONTENT" },
      })
      await request.post("http://localhost:8081/__test/notifications", {
        headers,
        data: [
          {
            id: randomUUID(),
            userId: randomUUID(),
            type: "listing-refused",
            payload: { listingTitle: title },
            listingId: id,
            readAt: null,
            createdAt: new Date().toISOString(),
          },
        ],
      })
      // Reconnect/focus recovery loads the same notifications as the live event handler.
      await page.evaluate(() => window.dispatchEvent(new Event("focus")))
      await expect(card.getByText(badge, { exact: true })).toBeVisible()
      await page
        .locator("[data-notifications-trigger]")
        .filter({ visible: true })
        .first()
        .click()
      const panel = page.getByRole("region").filter({ hasText: message })
      await expect(panel.getByText(message, { exact: false })).toContainText(
        title,
      )
      await expect(panel.getByRole("link", { name: /./ })).toHaveAttribute(
        "href",
        "/listings/pending",
      )
    } finally {
      await request.delete(`http://localhost:8081/api/listings/${id}`)
    }
  })
}
