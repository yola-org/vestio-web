import { test, expect } from '@playwright/test';

test.describe('Welcome Page', () => {
  test('should load welcome page for unauthenticated users', async ({ page }) => {
    await page.goto('/welcome');
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be publicly accessible', async ({ page }) => {
    const response = await page.goto('/welcome');
    expect(response?.status()).toBeLessThan(400);
  });
});
