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
      await page.context().clearCookies({ name: 'vestio_token' });
      if (accessToken) {
        await page.context().addCookies([
          { name: 'vestio_token', value: accessToken, domain: 'localhost', path: '/' },
        ]);
      }

      await page.goto('/profile');

      await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible();
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
