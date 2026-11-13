import { test, expect } from "@playwright/test"

test("searches from the desktop header and applies filters to the same query", async ({
  page,
}) => {
  await page.goto("/welcome")
  await page.getByRole("button", { name: "Toutes les villes" }).click()
  await page.getByRole("button", { name: "Casablanca" }).click()
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
  expect(new URL(page.url()).searchParams.get("cityId")).toBe("1")
  await expect(
    page.getByRole("heading", { name: "Sac en cuir vintage" }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Hoodie gris essentiel" }),
  ).toHaveCount(0)
  await expect(page.getByRole("combobox", { name: "Villes" })).toHaveValue("1")

  await page.getByRole("spinbutton", { name: "Max" }).fill("300")
  await page.getByRole("button", { name: "Appliquer les filtres" }).click()
  await expect(page.getByText("Aucun article trouvé.")).toBeVisible()

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
  await page.getByRole("button", { name: "Toutes les villes" }).click()
  await page.getByRole("button", { name: "Rabat" }).click()
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
  expect(new URL(page.url()).searchParams.get("cityId")).toBe("2")
})

test("keeps a previous page link when a shared page has no results", async ({
  page,
}) => {
  await page.goto("/search?query=cuir+vintage&page=1")
  await expect(page.getByText("Aucun article trouvé.")).toBeVisible()
  await page.getByRole("link", { name: "Page précédente" }).click()
  await expect(
    page.getByRole("heading", { name: "Sac en cuir vintage" }),
  ).toBeVisible()
  expect(new URL(page.url()).searchParams.get("page")).toBeNull()
})
