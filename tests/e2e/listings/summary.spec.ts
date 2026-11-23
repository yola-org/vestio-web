import { expect, test } from "@playwright/test"

for (const legacyThumbnail of [false, true]) {
  test(`cards open the largest rendition with ${
    legacyThumbnail ? "legacy" : "current"
  } thumbnails`, async ({ page, request }) => {
    const title = `Summary cover ${
      legacyThumbnail ? "legacy" : "current"
    } assets`
    const description = "A full description available on the detail page."
    const first = "10000000-0000-4000-8000-000000000001"
    const second = "10000000-0000-4000-8000-000000000002"
    const created = await request.post("http://localhost:8081/api/listings", {
      data: { title, description, price: 90, cityIds: ["1"], categoryId: "c1" },
    })
    const { id } = await created.json()
    try {
      await request.put(`http://localhost:8081/api/listings/${id}`, {
        data: { assetKeys: [first, second] },
      })
      const response = await request.get(
        "http://localhost:8081/api/listings/search",
        {
          params: { query: title },
        },
      )
      const [summary] = await response.json()
      expect(summary.coverAssetKey).toBe(first)
      expect(summary).not.toHaveProperty("assetKeys")
      expect(summary).not.toHaveProperty("description")
      expect(summary).not.toHaveProperty("contactTypes")

      await page.route("https://**/listings/**", (route) => {
        if (
          legacyThumbnail &&
          /_thumbnail(?:_mobile)?[.]webp$/.test(route.request().url())
        ) {
          return route.fulfill({ status: 404, body: "Missing flat thumbnail" })
        }
        return route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="blue"/></svg>',
        })
      })
      await page.context().addCookies([
        {
          name: "vestio_locale",
          value: "en",
          domain: "localhost",
          path: "/",
        },
      ])
      await page.goto(`/search?query=${encodeURIComponent(title)}`)
      const cover = page.getByRole("img", { name: title, exact: true })
      await expect(cover).toHaveAttribute(
        "src",
        new RegExp(
          `${first}${
            legacyThumbnail ? "/original-thumbnail" : "_thumbnail"
          }[.]webp$`,
        ),
      )
      await expect(cover).toHaveAttribute(
        "srcset",
        new RegExp(
          `${first}${
            legacyThumbnail ? "/original-thumbnail-mobile" : "_thumbnail_mobile"
          }[.]webp`,
        ),
      )
      await cover.hover()
      await expect
        .poll(() =>
          cover.evaluate(
            (image) => Number.parseFloat(getComputedStyle(image).scale) || 1,
          ),
        )
        .toBeGreaterThan(1.05)
      const preview = page.getByRole("button", {
        name: `View image of ${title}`,
        exact: true,
      })
      await preview.click()
      const dialog = page.getByRole("dialog", { name: title, exact: true })
      await expect(dialog).toBeVisible()
      await expect(
        dialog.getByRole("img", { name: title, exact: true }),
      ).toHaveAttribute("src", new RegExp(`${first}\\.webp$`))
      expect((await dialog.boundingBox())!.width).toBeGreaterThanOrEqual(
        page.viewportSize()!.width - 2,
      )
      await expect
        .poll(() => page.evaluate(() => document.body.style.overflow))
        .toBe("hidden")
      await page.screenshot({
        path: "/tmp/vestio-card-image-modal-desktop.png",
      })
      await dialog.getByRole("button", { name: "Close", exact: true }).click()
      await expect(dialog).toHaveCount(0)
      await expect(preview).toBeFocused()
      await expect
        .poll(() => page.evaluate(() => document.body.style.overflow))
        .toBe("")
      await preview.press("Enter")
      await expect(dialog).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(dialog).toHaveCount(0)
      await expect(preview).toBeFocused()

      await page.setViewportSize({ width: 390, height: 844 })
      await preview.click()
      await expect(dialog).toBeVisible()
      expect((await dialog.boundingBox())!.width).toBeGreaterThanOrEqual(388)
      await page.screenshot({ path: "/tmp/vestio-card-image-modal-mobile.png" })
      await page.keyboard.press("Escape")
      await expect(dialog).toHaveCount(0)
      await page.emulateMedia({ reducedMotion: "reduce" })
      await cover.hover()
      await expect(cover).toHaveCSS("scale", "none")
      await page.getByRole("link", { name: title, exact: true }).click()
      await expect(page.getByText(description, { exact: true })).toBeVisible()
      const detail = await (
        await request.get(`http://localhost:8081/api/listings/${id}`)
      ).json()
      expect(detail.assetKeys).toEqual([first, second])
      expect(detail.description).toBe(description)
    } finally {
      await request.delete(`http://localhost:8081/api/listings/${id}`)
    }
  })
}
