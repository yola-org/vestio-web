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
});
