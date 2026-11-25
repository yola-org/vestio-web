import { expect, test } from "@playwright/test"
import { randomUUID } from "node:crypto"

for (const [locale, badge, tab] of [
  ["en", "Refused", "Pending listings"],
  ["fr", "Refusée", "Annonces en attente"],
  ["ar", "مرفوض", "الإعلانات قيد الانتظار"],
]) {
  test(`refused listings use placeholders in pending and profile (${locale})`, async ({
    page,
    request,
  }) => {
    const title = `Refused-${randomUUID()}`
    const asset = randomUUID()
    const created = await request.post("http://localhost:8081/api/listings", {
      data: {
        title,
        status: "REJECTED_CONTENT",
        price: 100,
        cityIds: ["1"],
        categoryId: "c1",
      },
    })
    expect(created.ok()).toBeTruthy()
    const { id } = await created.json()
    const photoRequests: string[] = []
    page.on("request", (req) => {
      if (req.url().includes(asset)) photoRequests.push(req.url())
    })
    try {
      await request.put(`http://localhost:8081/api/listings/${id}`, {
        data: { assetKeys: [asset] },
      })
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
        {
          name: "vestio_token",
          value: "mock-access-token",
          domain: "localhost",
          path: "/",
        },
      ])
      if (locale === "ar")
        await page.setViewportSize({ width: 390, height: 844 })
      const checkCard = async () => {
        const card = page.getByRole("article").filter({
          has: page.getByRole("heading", { name: title, exact: true }),
        })
        await expect(card.getByText(badge, { exact: true })).toBeVisible()
        const image = card.getByRole("img", { name: title, exact: true })
        await expect(image).toHaveAttribute(
          "src",
          "/listing-image-unavailable.png",
        )
        await expect(image).not.toHaveAttribute("srcset")
        await expect(
          card.getByRole("link", { name: title, exact: true }),
        ).toHaveCount(0)
      }
      await page.goto("/listings/pending")
      await checkCard()
      await page.goto("/profile")
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toHaveCount(0)
      await page.getByRole("tab", { name: tab, exact: true }).click()
      await checkCard()
      expect(photoRequests).toEqual([])
      if (locale === "ar")
        await page.screenshot({
          path: "/tmp/vestio-rejected-content-ar.png",
          fullPage: true,
        })
    } finally {
      await request.delete(`http://localhost:8081/api/listings/${id}`)
    }
  })
}
