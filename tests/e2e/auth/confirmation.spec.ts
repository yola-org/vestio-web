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

test("duplicate signup shows the email-already-used message and stays on registration", async ({
  page,
}) => {
  await page
    .context()
    .addCookies([
      { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
    ])
  await page.goto("/register")
  await page.getByLabel("Full name").fill("Test User")
  await page.getByLabel("Email", { exact: true }).fill("test@example.com")
  await page.getByLabel("Password", { exact: true }).fill("Password123!")
  await page.getByRole("button", { name: "Create my account" }).click()
  await expect(
    page
      .locator("form #signup-error")
      .getByText(
        "This email is already associated with an account. Sign in or reset your password.",
        { exact: true },
      ),
  ).toBeVisible()
  await expect(page).toHaveURL("/register")
  await expect(page.locator('[data-toast-kind="error"]')).toHaveCount(0)
  await expect(page.getByLabel("Full name")).toHaveValue("Test User")
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    "Password123!",
  )
  await page.getByLabel("Email", { exact: true }).fill("different@example.com")
  await expect(page.locator("#signup-error")).toHaveCount(0)
})

test("signup validation errors are shown inside the form without a toast", async ({
  page,
}) => {
  await page
    .context()
    .addCookies([
      { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
    ])
  await page.goto("/register")
  await page.getByLabel("Full name").fill("Jane")
  await page
    .getByLabel("Email", { exact: true })
    .fill("jane-validation@example.com")
  await page.getByLabel("Password", { exact: true }).fill("Password123!")
  await page.getByRole("button", { name: "Create my account" }).click()
  await expect(page.locator("form #signup-error")).toHaveText(
    "Please check your details and correct the invalid fields.",
  )
  await expect(page.locator('[data-toast-kind="error"]')).toHaveCount(0)
})

for (const path of ["/login", "/register"]) {
  test(`unexpected auth errors keep the generic toast on ${path}`, async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([
        { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
      ])
    await page.goto(path)
    if (path === "/register")
      await page.getByLabel("Full name").fill("Test User")
    await page
      .getByLabel("Email", { exact: true })
      .fill("service-error@example.com")
    await page.getByLabel("Password", { exact: true }).fill("Password123!")
    await page
      .locator("form")
      .filter({ has: page.locator('input[name="password"]') })
      .locator('button[type="submit"]')
      .click()
    await expect(page.locator('[data-toast-kind="error"]')).toHaveText(
      /An unexpected error occurred/,
    )
    await expect(
      page.locator("form #login-error, form #signup-error"),
    ).toHaveCount(0)
    await expect(
      page.getByText("Provider unavailable", { exact: true }),
    ).toHaveCount(0)
    await expect(page).toHaveURL(path)
  })
}
