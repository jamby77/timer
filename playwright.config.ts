import { defineConfig, devices } from 'playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT || 3001)

const developmentURL = `http://localhost:${port}`
const existingServerURL = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: './e2e',
  testIgnore: '**/*.production.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: existingServerURL || developmentURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: existingServerURL ? undefined : {
    command: `pnpm dev --port ${port}`,
    url: developmentURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
