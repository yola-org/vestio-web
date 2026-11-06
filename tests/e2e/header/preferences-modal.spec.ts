import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../helpers/api-mock';

test.describe('Preferences Modal', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/');
  });

  test('should open preferences modal from user dropdown', async ({ page }) => {
    // The authenticated header is rendered client-side once auth resolves.
    const userButton = page.getByRole('button', { name: 'Mon compte' });
    await expect(userButton).toBeVisible({ timeout: 10_000 });
    await userButton.click();

    const prefsButton = page.getByRole('button', { name: /préférences/i });
    await expect(prefsButton).toBeVisible();
    await prefsButton.click();

    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
  });
});
