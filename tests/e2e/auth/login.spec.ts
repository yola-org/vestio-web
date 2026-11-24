import { test, expect } from "@playwright/test"
import { LoginPage } from "../../pages/LoginPage"

import { testUser } from "../../fixtures/users"

test.describe("Login", () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    await page
      .context()
      .addCookies([
        { name: "vestio_locale", value: "fr", domain: "localhost", path: "/" },
      ])
    loginPage = new LoginPage(page)
  })

  test("should display login form", async ({ page }) => {
    await loginPage.goto()
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await loginPage.goto()
    await loginPage.login("wrong@example.com", "wrongpass")

    await expect(loginPage.errorMessage).toHaveText(
      "Email ou mot de passe incorrect.",
    )
    await expect(page).toHaveURL("/login")
    await expect(page.locator("form #login-error")).toBeVisible()
    await expect(page.locator('[data-toast-kind="error"]')).toHaveCount(0)
  })

  test("should login successfully with valid credentials", async ({ page }) => {
    await loginPage.goto()
    await loginPage.login(testUser.email, testUser.password)

    await expect(page).toHaveURL("/")
    await expect
      .poll(
        async () =>
          (await page.context().cookies()).find(
            (cookie) => cookie.name === "vestio_authenticated",
          )?.value,
      )
      .toBe("1")
  })
})

for (const path of ["/login", "/register"]) {
  test(`password visibility toggles without submitting ${path}`, async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([
        { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
      ])
    await page.goto(path)
    const password = page.getByLabel("Password", { exact: true })
    await password.fill("Password123!")
    await expect(password).toHaveAttribute("type", "password")
    await page
      .getByRole("button", { name: "Show password", exact: true })
      .click()
    await expect(password).toHaveAttribute("type", "text")
    await expect(password).toHaveValue("Password123!")
    await expect(page).toHaveURL(path)
    await page
      .getByRole("button", { name: "Hide password", exact: true })
      .click()
    await expect(password).toHaveAttribute("type", "password")
    await expect(password).toHaveValue("Password123!")
    await expect(page).toHaveURL(path)
  })
}
