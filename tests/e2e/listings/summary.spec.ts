import { expect, test } from "@playwright/test"

for (const legacyThumbnail of [false, true]) {
  test(`card images open the listing page with ${
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
      const {
        items: [summary],
      } = await response.json()
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
      const waitForCover = async () => {
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
              legacyThumbnail
                ? "/original-thumbnail-mobile"
                : "_thumbnail_mobile"
            }[.]webp`,
          ),
        )
        await expect(cover).toHaveJSProperty("complete", true)
        await expect(cover).not.toHaveJSProperty("naturalWidth", 0)
      }
      await waitForCover()
      await cover.scrollIntoViewIfNeeded()
      const desktopImage = (await cover.boundingBox())!
      await page.mouse.move(
        desktopImage.x + desktopImage.width / 2,
        desktopImage.y + desktopImage.height / 2,
      )
      await expect(cover).toHaveCSS("scale", "none")
      await page.mouse.click(
        desktopImage.x + desktopImage.width / 2,
        desktopImage.y + desktopImage.height / 2,
      )
      await expect(page).toHaveURL(`/listings/${id}`)
      await expect(page.getByRole("dialog")).toHaveCount(0)
      await expect(page.getByText(description, { exact: true })).toBeVisible()

      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(`/search?query=${encodeURIComponent(title)}`)
      await waitForCover()
      await cover.scrollIntoViewIfNeeded()
      const mobileImage = (await cover.boundingBox())!
      await page.mouse.click(
        mobileImage.x + mobileImage.width / 2,
        mobileImage.y + mobileImage.height / 2,
      )
      await expect(page).toHaveURL(`/listings/${id}`)
      await expect(page.getByRole("dialog")).toHaveCount(0)
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
