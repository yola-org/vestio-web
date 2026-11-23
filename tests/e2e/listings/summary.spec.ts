import { expect, test } from "@playwright/test"

test("browse cards use a single cover while detail keeps all assets and description", async ({
  page,
  request,
}) => {
  const title = "Summary projection cover test"
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

    await page.route("https://**/listings/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="blue"/></svg>',
      }),
    )
    await page.goto(`/search?query=${encodeURIComponent(title)}`)
    const cover = page.getByRole("img", { name: title, exact: true })
    await expect(cover).toHaveAttribute(
      "src",
      new RegExp(`${first}_thumbnail\\.webp$`),
    )
    await expect(cover).toHaveAttribute(
      "srcset",
      new RegExp(`${first}_thumbnail_mobile\\.webp`),
    )
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
