import { defineConfig } from 'playwright/test'

import config from './playwright.config'

const port = Number(process.env.PLAYWRIGHT_PWA_PORT || 3007)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  ...config,
  testMatch: '**/*.production.spec.ts',
  testIgnore: [],
  use: { ...config.use, baseURL },
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
})
