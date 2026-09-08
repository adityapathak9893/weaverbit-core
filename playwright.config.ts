import { defineConfig, devices } from '@playwright/test';

// e2e for a *package* = the in-browser verification the SPEC mandates: render the
// building blocks in the local demo and confirm they look/behave right in all
// four display modes (desktop + mobile). Playwright boots the Vite demo itself.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // CI gets the html report as well as inline annotations, because the CI job uploads
  // playwright-report/ on failure — with only the 'github' reporter that directory is never
  // written and the upload step silently ships nothing.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // A trace only exists on the retry; a screenshot of the first failure always does.
    screenshot: 'only-on-failure',
  },
  // Both projects are Chromium: CI installs only that browser, and mobile here means the
  // viewport/touch profile, which is what the responsive floor actually needs proving on.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
