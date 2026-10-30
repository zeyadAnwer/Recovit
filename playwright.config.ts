import { defineConfig, devices } from '@playwright/test';

const PORT = 4400;
// `localhost` matters: with security.allowedDomains set, Astro only trusts the
// Host header for listed domains and otherwise uses localhost for request URLs.
const BASE_URL = `http://localhost:${PORT}`;

/**
 * End-to-end + accessibility tests against the production build served by
 * the production entry point (`node dist/server/entry.mjs`, not `astro
 * preview`, whose request URLs ignore the CLI port), with the in-memory email
 * provider. Run `pnpm build` first.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // Optional: run locally against an installed Chromium-based browser, e.g.
    // PW_EXECUTABLE="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    ...(process.env['PW_EXECUTABLE']
      ? { launchOptions: { executablePath: process.env['PW_EXECUTABLE'] } }
      : {}),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: 'node ./dist/server/entry.mjs',
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    env: {
      EMAIL_PROVIDER: 'test',
      RATE_LIMIT_MAX: '100',
      HOST: '127.0.0.1',
      PORT: String(PORT),
    },
  },
});
