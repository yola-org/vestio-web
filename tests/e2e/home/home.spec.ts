import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../helpers/api-mock';

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should not have infinite redirects', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 10000 });
    expect(page.url()).toBeTruthy();
  });
});

test('saves a listing across reloads and removes it from favorites', async ({ page }) => {
  await setupAuthenticatedSession(page);
  const addName = 'Ajouter Sac en cuir vintage aux favoris';
  const removeName = 'Retirer Sac en cuir vintage des favoris';
  const add = page.getByRole('button', { name: addName });
  const remove = page.getByRole('button', { name: removeName });

  await page.goto('/');
  await add.click();
  await expect(remove).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(remove).toBeEnabled();
  await page.getByRole('link', { name: 'Favoris', exact: true }).click();
  await expect(page).toHaveURL('/favorites');
  await expect(page.getByRole('heading', { name: 'Vos favoris' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sac en cuir vintage' })).toBeVisible();
  await remove.click();
  await expect(page.getByText('Vous n’avez pas encore d’articles favoris.')).toBeVisible();

  await page.getByRole('link', { name: 'Parcourir les articles' }).click();
  await expect(add).toBeEnabled();
  await expect(add).toHaveAttribute('aria-pressed', 'false');
});

test('opens favorites from the mobile menu', async ({ page }) => {
  await setupAuthenticatedSession(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /ouvrir le menu/i }).click();
  await page.getByRole('link', { name: 'Favoris', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Vos favoris' })).toBeVisible();
});

test('requires an authenticated session to open favorites', async ({ page }) => {
  await page.goto('/favorites');
  await expect(page).toHaveURL('/login');
});
