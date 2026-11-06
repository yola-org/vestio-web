import { test, expect } from '@playwright/test';
import { HeaderComponent } from '../../pages/HeaderComponent';


test.describe('Header Categories Dropdown', () => {
  let header: HeaderComponent;

  test.beforeEach(async ({ page }) => {
    header = new HeaderComponent(page);
    await page.goto('/');
  });

  test('should open categories dropdown', async ({ page }) => {
    // Look for "All Categories" or similar button
    const categoriesBtn = page.locator('button').filter({ hasText: /TOUT|CATÉGORIES|CATEGORIES/i }).first();
    if (await categoriesBtn.isVisible()) {
      await categoriesBtn.click();
      await page.waitForTimeout(300);
      // Dropdown should be visible
      const dropdown = page.locator('[role="menu"], .absolute').first();
      await expect(dropdown).toBeVisible();
    }
  });
});
