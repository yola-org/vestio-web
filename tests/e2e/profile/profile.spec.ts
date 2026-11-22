import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../helpers/api-mock';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test('should load profile page when authenticated', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows pending listings in the profile tab and from the account menu', async ({ page }) => {
    await page.goto('/profile');

    const articlesTab = page.getByRole('tab', { name: /^Articles/ });
    const pendingTab = page.getByRole('tab', { name: 'Annonces en attente' });
    const pendingPanel = page.getByRole('tabpanel', { name: 'Annonces en attente' });
    const listingTitle = 'Veste en cours de traitement';

    await expect(articlesTab).toHaveAttribute('aria-selected', 'true');
    await articlesTab.focus();
    await articlesTab.press('ArrowRight');
    await expect(pendingTab).toBeFocused();
    await expect(pendingPanel.getByRole('heading', { name: listingTitle })).toBeVisible();
    await pendingTab.press('ArrowLeft');
    await expect(articlesTab).toBeFocused();
    await expect(pendingPanel).toBeHidden();

    await page.getByRole('button', { name: 'Mon compte', exact: true }).click();
    await page.getByRole('link', { name: 'Annonces en attente', exact: true }).click();
    await expect(page).toHaveURL('/listings/pending');
    await expect(page.getByRole('heading', { name: listingTitle })).toBeVisible();
  });

  for (const accessToken of ['expired-access-token', undefined]) {
    test(`renews the session when the access token is ${accessToken ? 'expired' : 'missing'}`, async ({ page }) => {
      const sessionRequests: string[] = [];
      page.on('request', (request) => {
        if (new URL(request.url()).pathname === '/api/auth/session') {
          sessionRequests.push(request.method());
        }
      });
      await page.context().clearCookies({ name: 'vestio_token' });
      if (accessToken) {
        await page.context().addCookies([
          { name: 'vestio_token', value: accessToken, domain: 'localhost', path: '/' },
        ]);
      }

      await page.goto('/profile');

      await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible();
      expect(sessionRequests).toEqual(accessToken ? [] : ['POST']);
      const cookies = await page.context().cookies();
      expect(cookies).toEqual(expect.arrayContaining([
        expect.objectContaining({ name: 'vestio_token', value: 'refreshed-access-token', httpOnly: true }),
        expect.objectContaining({ name: 'vestio_id_token', value: 'refreshed-id-token', httpOnly: true }),
        expect.objectContaining({ name: 'vestio_refresh_token', value: 'mock-refresh-token' }),
      ]));
    });
  }

  test('clears the session when Cognito rejects the refresh token', async ({ page }) => {
    await page.context().addCookies([
      { name: 'vestio_token', value: 'expired-access-token', domain: 'localhost', path: '/' },
      { name: 'vestio_refresh_token', value: 'expired-refresh-token', domain: 'localhost', path: '/' },
    ]);

    await page.goto('/profile');

    await expect.poll(async () => {
      const cookies = await page.context().cookies();
      return cookies.filter(({ name }) => [
        'vestio_token', 'vestio_refresh_token', 'vestio_id_token', 'vestio_authenticated',
      ].includes(name));
    }).toEqual([]);
  });
});

for (const locale of ["en", "ar"] as const) {
  test(`uploads profile images directly and refreshes avatars (${locale})`, async ({ page }) => {
    await setupAuthenticatedSession(page)
    await page.context().addCookies([
      { name: "vestio_locale", value: locale, domain: "localhost", path: "/" },
      { name: "vestio_token", value: `notification-test-avatar-${Date.now()}-${locale}`, domain: "localhost", path: "/" },
    ])
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j/1sAAAAASUVORK5CYII=", "base64")
    await page.route("https://*.s3.ca-central-1.amazonaws.com/users/**", (route) => route.fulfill({ contentType: "image/png", body: png }))
    if (locale === "ar") await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/profile")
    const changePhoto = page.getByRole("button", { name: locale === "en" ? "Change photo" : "تغيير الصورة", exact: true })
    await changePhoto.click()
    const dialog = page.getByRole("dialog", { name: locale === "en" ? "Change photo" : "تغيير الصورة" })
    await expect(dialog).toBeVisible()
    await expect(page).toHaveURL("/profile")
    const upload = dialog.locator('#profile-image input[type="file"]')
    await upload.setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: png })
    await expect(page.getByRole("status")).toContainText(locale === "en" ? "Profile photo updated." : "تم تحديث صورة الملف الشخصي.")
    const image = dialog.locator("#profile-image img")
    await expect(image).toHaveAttribute("src", /users\/.*\/profile\/.*\.png$/)
    const firstUrl = await image.getAttribute("src")
    const displayCookie = (await page.context().cookies()).find((cookie) => cookie.name === "vestio_display_name")
    expect(displayCookie).toBeDefined()
    const display = JSON.parse(decodeURIComponent(displayCookie!.value))
    expect(display.profileImageKey).toMatch(/^[0-9a-f-]{36}\/profile\/[0-9a-f-]{36}\.png$/)
    expect(firstUrl).toContain(`/users/${display.profileImageKey}`)
    await expect(page.locator("header [role='img'] img").first()).toHaveAttribute("src", firstUrl!)
    await upload.setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: png })
    await expect.poll(async () => {
      const src = await image.getAttribute("src")
      return src?.startsWith("https://") && src !== firstUrl
    }).toBe(true)
    const secondUrl = await image.getAttribute("src")
    await upload.setInputFiles({ name: "fail.png", mimeType: "image/png", buffer: png })
    await expect(page.locator("#profile-image").getByRole("alert")).toContainText(locale === "en" ? "Unable to upload" : "تعذر رفع")
    await expect(image).toHaveAttribute("src", secondUrl!)
    await upload.setInputFiles({ name: "photo.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") })
    await expect(page.locator("#profile-image").getByRole("alert")).toContainText(locale === "en" ? "Choose a JPEG" : "اختر صورة")
    await dialog.getByRole("button", { name: locale === "en" ? "Close" : "إغلاق", exact: true }).click()
    await expect(dialog).not.toBeVisible()
    const profileImage = page.locator("main [role='img'] img")
    await expect(profileImage).toHaveAttribute("src", secondUrl!)
    await expect(profileImage).toHaveJSProperty("naturalWidth", 1)
    await page.reload()
    await expect(profileImage).toHaveAttribute("src", secondUrl!)
    await page.goto("/settings")
    await expect(page.locator("#profile-image img")).toHaveAttribute("src", secondUrl!)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  })
}
