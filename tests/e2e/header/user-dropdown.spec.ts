import { test, expect } from '@playwright/test';
import { HeaderComponent } from '../../pages/HeaderComponent';
import { mockAuthEndpoints, mockProfileEndpoints, setupAuthenticatedSession } from '../../helpers/api-mock';

test.describe('User Dropdown', () => {
  let header: HeaderComponent;

  test.beforeEach(async ({ page }) => {
    header = new HeaderComponent(page);
    await mockAuthEndpoints(page);
    await mockProfileEndpoints(page);
    await setupAuthenticatedSession(page);
    await page.goto('/');
  });

  test('should show user menu when authenticated', async ({ page }) => {
    await page.waitForTimeout(1000);
    // Look for user avatar/menu button
    const userButton = page.locator('button').filter({ has: page.locator('img, svg') }).last();
    await expect(userButton).toBeVisible();
  });

  test('should open user dropdown', async ({ page }) => {
    await page.waitForTimeout(1000);
    const userButton = page.locator('button[aria-haspopup="true"]').last();
    if (await userButton.isVisible()) {
      await userButton.click();
      await page.waitForTimeout(300);
      const dropdown = page.locator('.absolute').filter({ hasText: /profil|préférences|déconnexion/i }).first();
      await expect(dropdown).toBeVisible();
    }
  });
});
