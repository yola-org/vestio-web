import { Page } from '@playwright/test';

/**
 * The e2e suite runs against a mock backend (tests/mock-backend.mjs) started
 * as a webServer in playwright.config.ts — all /api/* calls, including the
 * ones made by Server Actions, are served by it.
 *
 * There is therefore nothing to intercept in the browser. This helper only
 * seeds the authenticated session by setting the same cookies that
 * loginAction sets (keep in sync with src/constants/auth.ts).
 */
export async function setupAuthenticatedSession(page: Page) {
  await page.context().addCookies([
    {
      name: 'vestio_token',
      value: 'mock-access-token',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'vestio_refresh_token',
      value: 'mock-refresh-token',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'vestio_id_token',
      value: 'mock-id-token',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'vestio_authenticated',
      value: '1',
      domain: 'localhost',
      path: '/',
    },
  ]);

  await page.addInitScript(() => {
    localStorage.setItem('vestio_was_authenticated', '1');
  });
}
