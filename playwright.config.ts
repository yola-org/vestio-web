import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/**
 * CI runs the suite against a production build (`next build && next start`)
 * instead of the dev server: no on-demand compilation or HMR, deterministic
 * pages, and it doubles as a build check. Locally the suite runs against
 * `next dev` for faster iteration. Use `CI=true npm run test:e2e` to
 * reproduce the CI setup locally.
 */
const appServer = isCI
  ? {
      command: 'npm run build && npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 10 * 60 * 1000,
      env: {
        ...process.env,
        API_URL: 'http://localhost:8081',
        NEXT_PUBLIC_API_URL: 'http://localhost:8081',
      },
    }
  : {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000,
      env: {
        ...process.env,
        API_URL: 'http://localhost:8081',
        NEXT_PUBLIC_API_URL: 'http://localhost:8081',
      },
    };

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      // Mock backend: Server Actions call the backend from the Next.js server,
      // so page.route() cannot stub it. Point the app at this mock instead.
      command: 'node tests/mock-backend.mjs',
      url: 'http://localhost:8081/healthz',
      reuseExistingServer: !isCI,
      timeout: 30 * 1000,
    },
    appServer,
  ],
});
