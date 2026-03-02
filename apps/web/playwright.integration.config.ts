import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Tier 2 integration test configuration
 *
 * Runs against real API server + Supabase backend.
 * Anthropic SDK is mocked at the API layer for deterministic responses.
 *
 * Key differences from Tier 1 (playwright.config.ts):
 * - Single worker to avoid race conditions on shared backend state
 * - webServer array starts both API + web dev servers
 * - globalSetup validates API reachability before running specs
 * - Test directory: e2e-integration/ (not e2e/)
 */

const API_PORT = 3001;
const WEB_PORT = 5173;
const API_BASE_URL = `http://localhost:${API_PORT}`;
const WEB_BASE_URL = `http://localhost:${WEB_PORT}`;

export default defineConfig({
  testDir: './e2e-integration',
  globalSetup: './e2e-integration/global-setup.ts',

  /* Run specs sequentially to avoid shared-backend race conditions */
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : 'html',

  use: {
    baseURL: WEB_BASE_URL,
    trace: 'on-first-retry',
    /* Pass API URL so helpers can reach the backend directly */
    extraHTTPHeaders: {
      'X-Test-API-URL': API_BASE_URL,
    },
  },

  projects: [
    {
      name: 'integration',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'pnpm --filter api dev',
      url: `${API_BASE_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      cwd: '../../',
    },
    {
      command: 'pnpm --filter web dev',
      url: WEB_BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      cwd: '../../',
    },
  ],
});
