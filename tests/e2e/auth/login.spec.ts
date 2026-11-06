import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

import { testUser } from '../../fixtures/users';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('should display login form', async ({ page }) => {
    await loginPage.goto();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpass');
    
    await page.waitForTimeout(500);
    const hasError = await page.locator('text=/invalid|erreur|incorrect/i').isVisible().catch(() => false);
    expect(hasError || await loginPage.errorMessage.isVisible().catch(() => false)).toBeTruthy();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // On success the page redirects away from /login.
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
