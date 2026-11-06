import { test, expect } from '@playwright/test';
import { mockProfileEndpoints } from '../../helpers/api-mock';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockProfileEndpoints(page);
  });

  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should not have infinite redirects', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 10000 });
    expect(page.url()).toBeTruthy();
  });
});
