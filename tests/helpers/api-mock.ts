import { Page } from '@playwright/test';
import { mockCategories, mockCities, mockProfile } from '../fixtures/users';

export async function mockAuthEndpoints(page: Page) {
  // Mock login - catch various patterns including server actions
  const loginHandler = async (route: any) => {
    const request = route.request();
    let postData: any = null;
    try {
      postData = request.postDataJSON();
    } catch {
      try {
        const text = request.postData();
        if (text) postData = JSON.parse(text);
      } catch {}
    }
    
    if (postData?.email === 'test@example.com' && postData?.password === 'Password123!') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    } else if (postData?.email || postData?.password) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'ERR_UNAUTHORIZED',
          message: 'Invalid credentials',
        }),
      });
    } else {
      // For server actions, might need different handling
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    }
  };

  await page.route('**/api/auth/login', loginHandler);
  await page.route('**/auth/login', loginHandler);
  await page.route('**/_next/action*', loginHandler);

  // Mock signup
  await page.route('**/api/auth/signup', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify('Registration successful'),
    });
  });

  // Mock logout
  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(null),
    });
  });
}

export async function mockProfileEndpoints(page: Page) {
  await page.route('**/api/users/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProfile),
    });
  });

  await page.route('**/api/categories', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCategories),
    });
  });

  await page.route('**/api/cities', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCities),
    });
  });

  await page.route('**/api/categories/groups', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/onboarding/status', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ completed: false }),
    });
  });

  await page.route('**/api/preferences**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

export async function setupAuthenticatedSession(page: Page) {
  // Set auth cookies
  await page.context().addCookies([
    {
      name: 'vestio_token',
      value: 'mock-access-token',
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
  
  // Set localStorage
  await page.addInitScript(() => {
    localStorage.setItem('vestio_was_authenticated', '1');
  });
}
