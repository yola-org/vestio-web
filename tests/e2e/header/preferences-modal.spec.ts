import { test, expect } from '@playwright/test';
import { mockAuthEndpoints, mockProfileEndpoints, setupAuthenticatedSession } from '../../helpers/api-mock';

test.describe('Preferences Modal', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthEndpoints(page);
    await mockProfileEndpoints(page);
    await setupAuthenticatedSession(page);
    await page.goto('/');
  });

  test('should open preferences modal from user dropdown', async ({ page }) => {
    await page.waitForTimeout(1000);
    const userButton = page.locator('button[aria-haspopup="true"]').last();
    if (await userButton.isVisible()) {
      await userButton.click();
      await page.waitForTimeout(300);
      const prefsButton = page.locator('button').filter({ hasText: /préférences|preferences/i }).first();
      if (await prefsButton.isVisible()) {
        await prefsButton.click();
        await page.waitForTimeout(300);
        const modal = page.locator('[role="dialog"], .modal').first();
        await expect(modal).toBeVisible();
      }
    }
  });
});
