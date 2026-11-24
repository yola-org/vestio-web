import { test, expect, type Page, type Locator } from "@playwright/test"

async function limitPrice(page: Page) {
  const max = page.getByRole("slider", { name: "Max", exact: true })
  await max.scrollIntoViewIfNeeded()
  const thumb = (await max.boundingBox())!
  const track = (await page.locator("[data-price-slider]").boundingBox())!
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2)
  await page.mouse.down()
  await page.mouse.move(track.x + track.width * 0.04, thumb.y + thumb.height / 2, { steps: 8 })
  await page.mouse.up()
}

test("searches from the desktop header and applies filters to the same query", async ({
  page,
}) => {
  await page.goto("/welcome")
  await page.locator("header").getByRole("button", { name: "Toutes les villes" }).click()
  await page.locator("header").getByRole("button", { name: "Casablanca", exact: true }).click()
  const search = page.getByRole("searchbox")
  await search.fill("cuir vintage")
  const preview = page.getByRole("search")
  await expect(
    preview.getByText("Sac en cuir vintage", { exact: true }),
  ).toBeVisible()
  await expect(
    preview.getByText("Magnifique sac en cuir vintage."),
  ).toBeVisible()
  await expect(preview.getByText("Très bon état")).toBeVisible()
  await expect(preview.getByText("Casablanca")).toBeVisible()
  await search.press("Escape")
  await expect(
    preview.getByText("Sac en cuir vintage", { exact: true }),
  ).toHaveCount(0)
  await expect(search).toHaveValue("cuir vintage")
  await search.press("Enter")

  await expect(page).toHaveURL(/\/search\?/)
  expect(new URL(page.url()).searchParams.get("cityIds")).toBe("1")
  await expect(
    page.getByRole("heading", { name: "Sac en cuir vintage" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Hoodie gris essentiel" }),
  ).toHaveCount(0)
  await expect(page.locator('aside input[name="cityIds"]')).toHaveValue("1")

  await limitPrice(page)
  await page.getByRole("button", { name: "Appliquer les filtres" }).click()
  await expect(page.getByRole("main").filter({ visible: true }).getByRole("heading", { name: "Aucune annonce trouvée", exact: true })).toBeVisible()

  await page.getByRole("link", { name: "Réinitialiser les filtres" }).click()
  await expect(
    page.getByRole("heading", { name: "Sac en cuir vintage" }),
  ).toBeVisible()
  await expect(page.getByRole("searchbox")).toHaveValue("cuir vintage")
})

test("searches from the mobile menu with a city", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/welcome")
  await page.getByRole("button", { name: "Ouvrir le menu" }).click()
  await page.locator("header").getByRole("button", { name: "Toutes les villes" }).click()
  await page.locator("header").getByRole("button", { name: "Rabat", exact: true }).click()
  await page.getByRole("searchbox").fill("hoodie")
  const preview = page.getByRole("search")
  await expect(preview.getByText("Hoodie gris essentiel")).toBeVisible()
  await expect(preview.getByText("Taille : M")).toBeVisible()
  await expect(preview.getByText("290 DH")).toBeVisible()
  await preview.getByRole("button", { name: "Voir tous les résultats" }).click()

  await expect(page).toHaveURL(/\/search\?/)
  await expect(
    page.getByRole("heading", { name: "Hoodie gris essentiel" }),
  ).toBeVisible()
  expect(new URL(page.url()).searchParams.get("cityIds")).toBe("2")
})

test("keeps a previous page link when a shared page has no results", async ({
  page,
}) => {
  await page.goto("/search?query=cuir+vintage&page=1")
  await expect(page.getByRole("main").filter({ visible: true }).getByRole("heading", { name: "Aucune annonce trouvée", exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Page précédente" }).click()
  await expect(
    page.getByRole("heading", { name: "Sac en cuir vintage" }),
  ).toBeVisible()
  expect(new URL(page.url()).searchParams.get("page")).toBeNull()
})

test("opens a listing from search as a guest on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/search?query=cuir+vintage")
  await page.getByRole("link", { name: "Sac en cuir vintage" }).click()

  await expect(page).toHaveURL(/\/listings\/00000000-0000-4000-8000-000000000001$/)
  const main = page.getByRole("main")
  await expect(main.getByRole("heading", { name: "Sac en cuir vintage" })).toBeVisible()
  await expect(main.getByText("380 DH")).toBeVisible()
  await expect(main.getByText("Magnifique sac en cuir vintage.")).toBeVisible()
  await expect(main.getByText("Très bon état")).toBeVisible()
  await expect(main.getByText("Casablanca")).toBeVisible()
  await expect(main.getByRole("link", { name: "Ajouter aux favoris" })).toHaveAttribute("href", "/login")
})

test("shows a listing-specific message for missing items", async ({ page }) => {
  await page.goto("/listings/00000000-0000-4000-8000-000000000099")
  await expect(page.getByRole("heading", { name: "Annonce introuvable" })).toBeVisible()
  await page.getByRole("link", { name: "Voir les annonces" }).click()
  await expect(page).toHaveURL(/\/search$/)
})

test("browses a category and returns from a subcategory to its parent", async ({
  page,
}) => {
  await page.goto("/welcome")
  const categoryTile = page
    .getByRole("main")
    .getByRole("link", { name: "Homme", exact: true })
  await categoryTile.scrollIntoViewIfNeeded()
  await categoryTile.click()

  await expect(page).toHaveURL(/\/categories\/homme$/)
  const main = page.getByRole("main")
  await expect(
    main.getByRole("heading", { name: "Homme", exact: true }),
  ).toBeVisible()
  await expect(
    main.getByRole("heading", { name: "Hoodie gris essentiel" }),
  ).toBeVisible()
  await expect(
    main.getByRole("heading", { name: "Baskets rétro" }),
  ).toBeVisible()
  await expect(
    main.getByRole("heading", { name: "Sac en cuir vintage" }),
  ).toHaveCount(0)

  await main.getByRole("link", { name: "T-shirts" }).click()
  await expect(page).toHaveURL(/\/categories\/homme\/t-shirts$/)
  await expect(
    main.getByRole("heading", { name: "Baskets rétro" }),
  ).toBeVisible()
  await expect(
    main.getByRole("heading", { name: "Hoodie gris essentiel" }),
  ).toHaveCount(0)

  await limitPrice(page)
  await main.getByRole("button", { name: "Appliquer les filtres" }).click()
  await expect(page).toHaveURL(/\/categories\/homme\/t-shirts\?/)
  await expect(main.getByRole("heading", { name: "Aucune annonce trouvée", exact: true })).toBeVisible()

  await main.getByRole("link", { name: "Homme", exact: true }).click()
  await expect(page).toHaveURL(/\/categories\/homme$/)
  await expect(
    main.getByRole("heading", { name: "Hoodie gris essentiel" }),
  ).toBeVisible()
})

test("uses category names in search URLs and redirects older links", async ({
  page,
}) => {
  await page.goto("/search?query=baskets")
  const main = page.getByRole("main")
  await main.getByRole("combobox", { name: "Catégories" }).click()
  await main.getByRole("option", { name: "Homme / T-shirts", exact: true }).click()
  await main.getByRole("button", { name: "Appliquer les filtres" }).click()
  await expect(page).toHaveURL(/\/categories\/homme\/t-shirts\?/)
  expect(new URL(page.url()).searchParams.get("query")).toBe("baskets")
  expect(new URL(page.url()).searchParams.has("categoryId")).toBe(false)
  await expect(main.getByRole("heading", { name: "Baskets rétro" })).toBeVisible()

  await page.goto("/categories/c21?query=baskets")
  await expect(page).toHaveURL(/\/categories\/homme\/t-shirts\?query=baskets$/)
})

function selected(url: string, key: string) {
  return new URL(url).searchParams.getAll(key).flatMap((value) => value.split(",")).sort()
}

for (const locale of ["en", "ar"] as const) {
  test(`multiple dropdown filters survive reload, pagination and clearing (${locale})`, async ({ page }) => {
    await page.context().addCookies([{ name: "vestio_locale", value: locale, domain: "localhost", path: "/" }])
    if (locale === "ar") await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/search")
    const panel = page.locator("aside").filter({ has: page.locator('input[name="gender"]') })
    const selections = { cityIds: ["1", "2"], conditions: ["GOOD", "VERY_GOOD"], contactTypes: ["DELIVERY", "MEETUP"] }
    for (const [name, values] of Object.entries(selections)) {
      for (const value of values) await setMulti(panel, name, value)
    }
    await panel.locator('button[type="submit"]').click()
    await expect(page.getByRole("heading", { name: "Sac en cuir vintage" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Baskets rétro" })).toHaveCount(0)
    for (const [name, values] of Object.entries(selections)) expect(selected(page.url(), name)).toEqual([...values].sort())
    await setMulti(panel, "sizeIds", "s1")
    await setMulti(panel, "sizeIds", "s2")
    await panel.locator('button[type="submit"]').click()
    await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Sac en cuir vintage" })).toHaveCount(0)
    await page.reload()
    for (const [name, values] of Object.entries({ ...selections, sizeIds: ["s1", "s2"] })) {
      for (const value of values) await expect(panel.locator(`input[name="${name}"][value="${value}"]`)).toHaveCount(1)
    }
    const nextPage = new URL(page.url())
    nextPage.searchParams.set("page", "1")
    await page.goto(nextPage.toString())
    await page.locator('main nav a').filter({ hasText: locale === "en" ? "Previous page" : "الصفحة السابقة" }).click()
    await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toBeVisible()
    expect(selected(page.url(), "sizeIds")).toEqual(["s1", "s2"])
    for (const [name, values] of Object.entries({ ...selections, sizeIds: ["s1", "s2"] })) {
      for (const value of values) await setMulti(panel, name, value, false)
    }
    await panel.locator('button[type="submit"]').click()
    await expect(page.getByRole("heading", { name: "Baskets rétro" })).toBeVisible()
    for (const name of [...Object.keys(selections), "sizeIds"]) expect(selected(page.url(), name)).toEqual([])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  })
}

for (const mobile of [false, true]) {
  test(`header search changes city and preserves other filters (${mobile ? "mobile" : "desktop"})`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/search?cityIds=1,2&conditions=GOOD,VERY_GOOD")
    if (mobile) await page.getByRole("button", { name: "Ouvrir le menu" }).click()
    const header = page.locator("header")
    await header.getByRole("button", { name: "Casablanca", exact: true }).click()
    await header.getByRole("button", { name: "Rabat", exact: true }).click()
    const search = page.getByRole("searchbox")
    await search.fill("hoodie")
    await expect(page.getByRole("search").getByText("Hoodie gris essentiel")).toBeVisible()
    await search.press("Enter")
    await expect.poll(() => new URL(page.url()).searchParams.get("query")).toBe("hoodie")
    await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toBeVisible()
    expect(selected(page.url(), "cityIds")).toEqual(["2"])
    expect(selected(page.url(), "conditions")).toEqual(["GOOD", "VERY_GOOD"])
    expect(new URL(page.url()).searchParams.has("cityId")).toBe(false)
  })
}

test("category redirects preserve repeated filter selections", async ({ page }) => {
  await page.goto("/search?category=homme&cityIds=1&cityIds=2&sizeIds=s1&sizeIds=s2&conditions=GOOD&conditions=VERY_GOOD&contactTypes=DELIVERY&contactTypes=PARCEL")
  await expect(page).toHaveURL(/\/categories\/homme\?/)
  for (const [name, values] of Object.entries({ cityIds: ["1", "2"], sizeIds: ["s1", "s2"], conditions: ["GOOD", "VERY_GOOD"], contactTypes: ["DELIVERY", "PARCEL"] })) {
    expect(selected(page.url(), name)).toEqual([...values].sort())
    for (const value of values) await expect(page.locator(`aside input[name="${name}"][value="${value}"]`)).toHaveCount(1)
  }
  await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toBeVisible()
})

async function setMulti(scope: Locator, name: string, value: string, selected = true) {
  const field = scope.locator(`[data-multiselect="${name}"]`).filter({ visible: true })
  const input = field.getByRole("combobox")
  await input.click()
  const option = field.locator(`[role="option"]:has([data-option-value="${value}"])`)
  await expect(option).toHaveAttribute("aria-selected", selected ? "false" : "true")
  await option.click()
  await expect(option).toHaveAttribute("aria-selected", String(selected))
  await input.press("Escape")
}

test("dropdowns support search, keyboard selection and clearing", async ({ page }) => {
  await page.context().addCookies([{ name: "vestio_locale", value: "en", domain: "localhost", path: "/" }])
  await page.goto("/search")
  const cities = page.locator('aside [data-multiselect="cityIds"]')
  const input = cities.getByRole("combobox")
  await input.fill("Rabat")
  await expect(cities.getByRole("option")).toHaveCount(1)
  await input.press("ArrowDown")
  await input.press("Enter")
  await expect(cities.locator('input[name="cityIds"]')).toHaveValue("2")
  await input.press("Escape")
  await input.press("Backspace")
  await expect(cities.locator('input[name="cityIds"]')).toHaveCount(0)
  await input.fill("no-city-matches-this")
  await expect(cities.getByText("No matching options")).toBeVisible()
  await input.press("Escape")
  await input.press("Tab")
  await page.locator('aside button[type="submit"]').click()
  await expect(page).toHaveURL(/\/search\?/)
  expect(new URL(page.url()).searchParams.has("cityIds")).toBe(false)
})

for (const locale of ["en", "ar"] as const) {
  test(`category dropdown groups parents and selects one category (${locale})`, async ({ page }) => {
    await page.context().addCookies([{ name: "vestio_locale", value: locale, domain: "localhost", path: "/" }])
    if (locale === "ar") await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/search?query=baskets")
    const field = page.locator("[data-category-select]")
    const input = field.getByRole("combobox")
    await input.click()
    await expect(field.locator(".category-select__group-heading")).toHaveText(["Femme", "Homme", "Shoes", "Accessories"])
    await expect(field.getByRole("checkbox")).toHaveCount(0)
    await field.getByRole("option", { name: "Femme", exact: true }).click()
    await expect(field.locator('input[name="category"]')).toHaveValue("femme")
    await input.fill("T-shirts")
    await expect(field.getByRole("option")).toHaveCount(1)
    await input.press("ArrowDown")
    await input.press("Enter")
    await expect(field.locator('input[name="category"]')).toHaveCount(1)
    await expect(field.locator('input[name="category"]')).toHaveValue("homme/t-shirts")
    await input.press("Backspace")
    await expect(field.locator('input[name="category"]')).toHaveValue("")
    await input.click()
    await field.getByRole("option", { name: "Homme / T-shirts", exact: true }).click()
    await page.locator('aside button[type="submit"]').click()
    await expect(page).toHaveURL(/\/categories\/homme\/t-shirts\?/)
    await expect(page.getByRole("heading", { name: "Baskets rétro" })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  })
}

for (const locale of ["en", "ar"] as const) {
  test(`multiple color swatches match any selection and can be cleared (${locale})`, async ({ page }) => {
    await page.context().addCookies([{ name: "vestio_locale", value: locale, domain: "localhost", path: "/" }])
    if (locale === "ar") await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/search?colors=%20bRoWn%20&colors=gRaY")
    const panel = page.locator("aside").filter({ has: page.locator('input[name="gender"]') })
    const colors = panel.locator("fieldset").filter({ has: page.locator('input[name="colors"]') })
    const color = (value: string) => colors.locator(`input[value="${value}"]`)
    await expect(color("Brown")).toBeChecked()
    await expect(color("Gray")).toBeChecked()
    await expect(page.getByRole("heading", { name: "Sac en cuir vintage" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Baskets rétro" })).toHaveCount(0)
    await colors.getByRole("button").click()
    await color("Blue").locator("..").click()
    await colors.getByRole("button").click()
    await expect(color("Blue")).toBeVisible()
    await expect(color("Blue")).toBeChecked()
    await panel.locator('button[type="submit"]').click()
    await expect.poll(() => selected(page.url(), "colors")).toEqual(["Blue", "Brown", "Gray"])
    await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toHaveCount(1)
    await page.reload()
    await expect(color("Brown")).toBeChecked()
    await expect(color("Gray")).toBeChecked()
    await expect(color("Blue")).toBeChecked()
    const nextPage = new URL(page.url())
    nextPage.searchParams.set("page", "1")
    await page.goto(nextPage.toString())
    await page.getByRole("link", { name: locale === "en" ? "Previous page" : "الصفحة السابقة", exact: true }).click()
    await expect(page.getByRole("heading", { name: "Hoodie gris essentiel" })).toBeVisible()
    expect(selected(page.url(), "colors")).toEqual(["Blue", "Brown", "Gray"])
    await color("").locator("..").click()
    await panel.locator('button[type="submit"]').click()
    await expect(page.getByRole("heading", { name: "Baskets rétro" })).toBeVisible()
    expect(new URL(page.url()).searchParams.has("colors")).toBe(false)
    expect(new URL(page.url()).searchParams.has("color")).toBe(false)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  })
}
