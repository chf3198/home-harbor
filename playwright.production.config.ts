/**
 * @fileoverview Playwright configuration for Production UAT tests
 * @description Runs E2E tests against the live GitHub Pages deployment
 * 
 * @example npx playwright test --config=playwright.production.config.ts
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'production-uat.spec.js', // Only run production UAT tests
  timeout: 90_000, // Longer timeout for production tests
  expect: {
    timeout: 30_000,
  },
  retries: 1, // Retry once on failure (network issues)
  use: {
    baseURL: 'https://chf3198.github.io/home-harbor/',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Production site needs real browser behavior
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    // Can add more browsers if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
  reporter: [
    ['html', { outputFolder: 'playwright-report-production' }],
    ['list'],
  ],
  // No global setup/teardown for production (no mock server needed)
});
