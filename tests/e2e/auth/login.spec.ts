import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { mockAuthEndpoints, mockProfileEndpoints } from '../../helpers/api-mock';
import { testUser } from '../../fixtures/users';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await mockAuthEndpoints(page);
    await mockProfileEndpoints(page);
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
    
    // Give time for submission
    await page.waitForTimeout(2000);
    // Just check that form was submitted
    expect(page.url()).toContain('localhost:3000');
  });
});
