import { expect, test } from "@playwright/test"
import { randomUUID } from "node:crypto"
import en from "../../../src/i18n/dictionaries/en"
import fr from "../../../src/i18n/dictionaries/fr"
import ar from "../../../src/i18n/dictionaries/ar"

const backend = "http://localhost:8081"
const oldPassword = "OldPassword123!"
const newPassword = "NewPassword456!"

for (const [locale, messages] of Object.entries({ en, fr, ar })) {
  test(`reset password uses the latest PIN and new credentials (${locale})`, async ({
    page,
    request,
  }) => {
    const email = `reset-${randomUUID()}@example.com`
    await request.post(`${backend}/api/auth/signup`, {
      data: {
        email,
        password: oldPassword,
        firstName: "Reset",
        lastName: "User",
      },
    })
    await request.post(`${backend}/api/auth/confirm-email`, {
      data: { email, pin: "012345" },
    })
    await page.context().addCookies([
      {
        name: "vestio_locale",
        value: locale,
        domain: "localhost",
        path: "/",
      },
    ])
    const t = messages.auth.reset
    await page.goto("/login")
    await page
      .getByLabel(messages.auth.register.email, { exact: true })
      .fill(email)
    await page.getByRole("link", { name: t.forgotLink, exact: true }).click()
    await expect(page.getByLabel(t.email, { exact: true })).toHaveValue(email)
    await page.getByRole("button", { name: t.send, exact: true }).click()
    await expect(page).toHaveURL(/\/reset-password\?email=/)
    await expect(page.getByText(t.sent, { exact: true })).toBeVisible()
    const first = await (
      await request.get(`${backend}/__test/password-reset`, {
        params: { email },
      })
    ).json()
    const pin = page.getByLabel(t.pin, { exact: true })
    await pin.fill("000000")
    await page.getByLabel(t.newPassword, { exact: true }).fill(newPassword)
    await page
      .getByLabel(t.confirmPassword, { exact: true })
      .fill("Mismatch12345!")
    await expect(page.getByText(t.mismatch, { exact: true })).toBeVisible()
    await expect(
      page.getByRole("button", { name: t.submit, exact: true }),
    ).toBeDisabled()
    await page.getByLabel(t.confirmPassword, { exact: true }).fill(newPassword)
    await page
      .getByRole("button", { name: messages.auth.showPassword, exact: true })
      .first()
      .click()
    await expect(
      page.getByLabel(t.newPassword, { exact: true }),
    ).toHaveAttribute("type", "text")
    await page.getByRole("button", { name: t.submit, exact: true }).click()
    await expect(page.getByText(t.invalid, { exact: true })).toBeVisible()

    // The one-minute cooldown returns the same generic response without issuing another PIN.
    await page.getByRole("button", { name: t.resend, exact: true }).click()
    await expect(page.getByText(t.sent, { exact: true })).toBeVisible()
    const throttled = await (
      await request.get(`${backend}/__test/password-reset`, {
        params: { email },
      })
    ).json()
    expect(throttled.pin).toBe(first.pin)
    await request.put(
      `${backend}/__test/password-reset?email=${encodeURIComponent(email)}`,
      { data: {} },
    )
    await page.getByRole("button", { name: t.resend, exact: true }).click()
    await expect
      .poll(
        async () =>
          (
            await (
              await request.get(`${backend}/__test/password-reset`, {
                params: { email },
              })
            ).json()
          ).pin,
      )
      .not.toBe(first.pin)
    const latest = await (
      await request.get(`${backend}/__test/password-reset`, {
        params: { email },
      })
    ).json()
    await pin.fill(first.pin)
    await page.getByRole("button", { name: t.submit, exact: true }).click()
    await expect(page.getByText(t.invalid, { exact: true })).toBeVisible()
    await pin.fill(latest.pin)
    await page.getByRole("button", { name: t.submit, exact: true }).click()
    await expect(page).toHaveURL("/login")
    await expect(page.getByText(t.success, { exact: true })).toBeVisible()
    const replay = await request.post(`${backend}/api/auth/reset-password`, {
      data: { email, pin: latest.pin, newPassword },
    })
    expect(replay.status()).toBe(400)

    await page
      .getByLabel(messages.auth.register.email, { exact: true })
      .fill(email)
    await page
      .getByLabel(messages.auth.register.password, { exact: true })
      .fill(oldPassword)
    await page
      .getByRole("button", { name: messages.auth.login.submit, exact: true })
      .click()
    await expect(
      page.getByText(messages.auth.login.invalidCredentials, { exact: true }),
    ).toBeVisible()
    await page
      .getByLabel(messages.auth.register.password, { exact: true })
      .fill(newPassword)
    await page
      .getByRole("button", { name: messages.auth.login.submit, exact: true })
      .click()
    await expect(page).toHaveURL("/")
  })
}

for (const [locale, messages] of Object.entries({ en, fr, ar })) {
  test(`unknown reset emails show a translated error inside the request form (${locale})`, async ({
    page,
    request,
  }) => {
    const email = `missing-${randomUUID()}@example.com`
    await page.context().addCookies([
      {
        name: "vestio_locale",
        value: locale,
        domain: "localhost",
        path: "/",
      },
    ])
    await page.goto("/forgot-password")
    await page
      .getByLabel(messages.auth.reset.email, { exact: true })
      .fill(email)
    await page
      .getByRole("button", { name: messages.auth.reset.send, exact: true })
      .click()
    await expect(page.locator("form #email-error")).toHaveText(
      messages.auth.reset.emailNotFound,
    )
    await expect(page).toHaveURL("/forgot-password")
    await expect(page.locator('[data-toast-kind="error"]')).toHaveCount(0)
    const response = await request.post(`${backend}/api/auth/forgot-password`, {
      data: { email },
    })
    expect(response.status()).toBe(400)
    expect((await response.json()).error).toBe("ERR_EMAIL_NOT_FOUND")
    expect(
      await (
        await request.get(`${backend}/__test/password-reset`, {
          params: { email },
        })
      ).json(),
    ).toBeNull()
    await page
      .getByLabel(messages.auth.reset.email, { exact: true })
      .fill(`other-${email}`)
    await expect(page.locator("#email-error")).toHaveCount(0)
  })
}

test("unknown email errors from reset and resend stay inside the reset form", async ({
  page,
}) => {
  const email = `missing-${randomUUID()}@example.com`
  const t = en.auth.reset
  await page
    .context()
    .addCookies([
      { name: "vestio_locale", value: "en", domain: "localhost", path: "/" },
    ])
  await page.goto(`/reset-password?email=${encodeURIComponent(email)}`)
  await page.getByLabel(t.pin, { exact: true }).fill("123456")
  await page.getByLabel(t.newPassword, { exact: true }).fill(newPassword)
  await page.getByLabel(t.confirmPassword, { exact: true }).fill(newPassword)
  await page.getByRole("button", { name: t.submit, exact: true }).click()
  await expect(page.locator("form #reset-error")).toHaveText(t.emailNotFound)
  await expect(page.locator('[data-toast-kind="error"]')).toHaveCount(0)
  await page.getByLabel(t.email, { exact: true }).fill(`other-${email}`)
  await expect(page.locator("#reset-error")).toHaveCount(0)
  await page.getByRole("button", { name: t.resend, exact: true }).click()
  await expect(page.locator("form #reset-error")).toHaveText(t.emailNotFound)
  await expect(page.locator('[data-toast-kind="error"]')).toHaveCount(0)
})
