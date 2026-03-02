/**
 * Tier 2 E2E global setup
 *
 * Validates that the real API server is reachable before running any
 * integration specs. Throws to skip the entire suite when the backend
 * is unavailable, providing a clear diagnostic message.
 *
 * Runs once before all specs via playwright.integration.config.ts globalSetup.
 */

const API_HEALTH_URL = `http://localhost:${process.env.API_PORT ?? 3001}/api/health`;
const HEALTH_CHECK_TIMEOUT_MS = 5_000;

/**
 * Fetch the API health endpoint with a timeout.
 *
 * Returns true when the server responds with status "ok",
 * false for any network or response error.
 */
async function checkApiHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    HEALTH_CHECK_TIMEOUT_MS
  );

  try {
    const response = await fetch(API_HEALTH_URL, {
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(
        `[global-setup] API health check returned HTTP ${response.status}`
      );
      return false;
    }

    const body = await response.json();
    return body.status === 'ok';
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.error(
      `[global-setup] API health check failed: ${message}`
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Playwright globalSetup entry point.
 *
 * Throws an error to abort the test run when the API is unreachable.
 */
export default async function globalSetup(): Promise<void> {
  console.log(`[global-setup] Checking API health at ${API_HEALTH_URL} ...`);

  const isHealthy = await checkApiHealth();

  if (!isHealthy) {
    throw new Error(
      `[global-setup] API server is not reachable at ${API_HEALTH_URL}. ` +
        'Start the API with `pnpm --filter api dev` or set API_PORT if using a non-default port.'
    );
  }

  console.log('[global-setup] API server is healthy. Proceeding with integration tests.');
}
