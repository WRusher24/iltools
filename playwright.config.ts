import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 3100);
const executablePath = process.env.PW_CHROMIUM_PATH || undefined; // local sandbox override; CI installs Playwright's own Chromium

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://localhost:${PORT}`, locale: 'he-IL', trace: 'retain-on-failure', launchOptions: { executablePath } },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, launchOptions: { executablePath } } },
    { name: 'mobile-360', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 }, launchOptions: { executablePath } } },
  ],
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
