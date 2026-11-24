import { expect, test } from "@playwright/test"

test("registration opens confirmation and accepts the emailed PIN", async ({
  page,
}) => {
  await page
    .context()
    .addCookies([
      { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
    ])
  await page.goto("/register")
  await page.getByLabel("Full name").fill("Jane Doe")
  await page.getByLabel("Email", { exact: true }).fill("jane@example.com")
  await page.getByLabel("Password", { exact: true }).fill("Password123!")
  await page.getByRole("button", { name: "Create my account" }).click()
  await expect(page).toHaveURL(/\/confirm-email\?email=/)
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue(
    "jane@example.com",
  )
  await page.getByRole("button", { name: "Send another PIN" }).click()
  await expect(
    page.getByText(
      "If your account needs verification, a new PIN has been sent.",
    ),
  ).toBeVisible()
  await page.getByLabel("Confirmation PIN").fill("999999")
  await page.getByRole("button", { name: "Confirm email", exact: true }).click()
  await expect(
    page.getByText(
      "Invalid or expired PIN. Use the latest email or request a new PIN.",
      { exact: true },
    ),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/confirm-email/)
  await page.getByLabel("Confirmation PIN").fill("012345")
  await page.getByRole("button", { name: "Confirm email", exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
})
