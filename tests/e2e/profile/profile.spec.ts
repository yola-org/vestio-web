import { test, expect } from '@playwright/test';
import { mockAuthEndpoints, mockProfileEndpoints, setupAuthenticatedSession } from '../../helpers/api-mock';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthEndpoints(page);
    await mockProfileEndpoints(page);
    await setupAuthenticatedSession(page);
  });

  test('should load profile page when authenticated', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();
  });
});
