import { expect, test } from "@playwright/test"
import { createTranslator } from "next-intl"
import en from "../../../src/i18n/dictionaries/en"
import fr from "../../../src/i18n/dictionaries/fr"
import { setupAuthenticatedSession } from "../../helpers/api-mock"

function flatten(messages: object, prefix = ""): Record<string, string> {
  return Object.fromEntries(
    Object.entries(messages).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return typeof value === "string"
        ? [[path, value]]
        : Object.entries(flatten(value, path))
    }),
  )
}

test("English covers every message and preserves interpolation arguments", () => {
  const english = flatten(en)
  const french = flatten(fr)
  expect(Object.keys(english).sort()).toEqual(Object.keys(french).sort())
  const errors: unknown[] = []
  const t = createTranslator({
    locale: "en",
    messages: en,
    onError: (error) => errors.push(error),
  })
  for (const [key, message] of Object.entries(english)) {
    const args = (value: string) =>
      [...value.matchAll(/\{(\w+)(?=[},])/g)].map((match) => match[1]).sort()
    expect(args(message), key).toEqual(args(french[key]))
    t(key, {
      count: 2,
      current: 1,
      total: 3,
      year: 2026,
      date: "November 22",
      relative: "2 hours ago",
      time: "10:00 AM",
      title: "Jacket",
      owner: "Seller",
      buyer: "Buyer",
      sender: "Buyer",
      amount: "100",
      currency: "DH",
      query: "Jacket",
      sizes: "M",
      name: "Member",
    })
  }
  expect(errors).toEqual([])
})

test("English selection persists and restores left-to-right layout", async ({
  page,
}) => {
  await page
    .context()
    .addCookies([
      { name: "vestio_locale", value: "ar", domain: "localhost", path: "/" },
    ])
  await page.goto("/login")
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
  await page
    .locator("header button[aria-haspopup='listbox']")
    .filter({ visible: true })
    .click()
  await page.getByRole("option", { name: "English", exact: true }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr")
  await expect(
    page.getByRole("heading", { name: "Welcome back!" }),
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(
    page.getByRole("heading", { name: "Welcome back!" }),
  ).toBeVisible()
  await page
    .locator("header")
    .getByRole("button", { name: "Language", exact: true })
    .click()
  await expect(
    page.getByRole("option", { name: "English", exact: true }),
  ).toHaveAttribute("aria-selected", "true")
  await page.getByRole("option", { name: "Français", exact: true }).click()
  await expect(page.locator("html")).toHaveAttribute("lang", "fr")
  await expect(
    page.getByRole("heading", { name: "Bon retour !" }),
  ).toBeVisible()
})

test("English translates authenticated header and user menu", async ({
  page,
}) => {
  await setupAuthenticatedSession(page)
  await page
    .context()
    .addCookies([
      { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
    ])
  await page.goto("/")
  const header = page.locator("header")
  await expect(
    header.getByRole("button", { name: "Offers", exact: true }),
  ).toBeVisible()
  await expect(header.getByRole("button", { name: /^Messages/ })).toBeVisible()
  await header.getByRole("button", { name: "My account", exact: true }).click()
  await expect(
    header.getByRole("link", { name: "My profile", exact: true }),
  ).toBeVisible()
  await expect(
    header.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible()
})
