import { expect, test } from "@playwright/test"

test("shares metadata across the header, homepage, footer and client navigation", async ({
  page,
}) => {
  const metadataResponses: string[] = []
  // Capture completed action responses rather than reading them during the
  // response event, when Chromium can discard their bodies during navigation.
  await page.route("http://localhost:3100/**", async (route) => {
    if (!route.request().headers()["next-action"]) return route.continue()
    const response = await route.fetch()
    metadataResponses.push(await response.text())
    await route.fulfill({ response })
  })
  await page.goto("/")
  const category = page.locator('header nav a[href^="/categories/"]').first()
  await expect(category).toBeVisible()
  await expect(
    page.locator('footer a[href^="/categories/"]').first(),
  ).toBeVisible()
  await page.waitForLoadState("networkidle")
  const countMetadata = async () =>
    metadataResponses.filter((body) => body.includes('"listingStatuses":[]'))
      .length
  await expect.poll(countMetadata).toBe(1)
  await category.click()
  await expect(page.locator("aside[aria-label]")).toBeVisible()
  await page.waitForLoadState("networkidle")
  expect(await countMetadata()).toBe(1)
})
