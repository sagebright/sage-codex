/**
 * Screenshot capture utility for visual review workflow
 *
 * Enables the /execute-issue visual review (Section 7.6) by providing
 * a programmatic API to capture screenshots at specific routes using
 * Playwright. The agent takes screenshots, analyzes them with Claude
 * vision, and evaluates against the Section 7.6.3 checklist.
 *
 * This is agent enablement — NOT automated visual regression testing.
 * No baseline comparison, no pixel diff.
 *
 * Pure utility functions (routeToFileName, buildUrl, types, constants)
 * are in screenshot-utils.ts to allow vitest unit testing without
 * importing Playwright.
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import {
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_WAIT_MS,
  DEFAULT_BASE_URL,
  DEFAULT_OUTPUT_DIR,
  routeToFileName,
  buildUrl,
  type ScreenshotOptions,
  type ScreenshotResult,
  type BatchScreenshotOptions,
} from './screenshot-utils';

// Re-export types and utilities for convenience
export {
  routeToFileName,
  buildUrl,
  type ScreenshotOptions,
  type ScreenshotResult,
  type BatchScreenshotOptions,
} from './screenshot-utils';

// =============================================================================
// Screenshot Capture
// =============================================================================

/**
 * Capture a single screenshot at the given route.
 *
 * Launches a headless Chromium browser, navigates to the route,
 * waits for the page to settle, then saves a PNG screenshot.
 *
 * The caller is responsible for ensuring the dev server is running.
 */
export async function captureScreenshot(
  options: ScreenshotOptions
): Promise<ScreenshotResult> {
  const {
    route,
    outputPath,
    viewportWidth = DEFAULT_VIEWPORT_WIDTH,
    viewportHeight = DEFAULT_VIEWPORT_HEIGHT,
    baseUrl = DEFAULT_BASE_URL,
    waitAfterNav = DEFAULT_WAIT_MS,
  } = options;

  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: viewportWidth, height: viewportHeight },
    });
    const page = await context.newPage();

    const url = buildUrl(baseUrl, route);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(waitAfterNav);

    await page.screenshot({ path: outputPath, fullPage: false });

    return { route, filePath: outputPath, success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { route, filePath: outputPath, success: false, error: message };
  } finally {
    await browser?.close();
  }
}

/**
 * Capture screenshots at multiple routes, reusing one browser instance.
 *
 * More efficient than calling captureScreenshot() in a loop because
 * it shares a single browser process across all captures.
 *
 * Returns results for every route, including failures.
 */
export async function captureScreenshots(
  options: BatchScreenshotOptions
): Promise<ScreenshotResult[]> {
  const {
    routes,
    baseUrl = DEFAULT_BASE_URL,
    outputDir = DEFAULT_OUTPUT_DIR,
    viewportWidth = DEFAULT_VIEWPORT_WIDTH,
    viewportHeight = DEFAULT_VIEWPORT_HEIGHT,
    waitAfterNav = DEFAULT_WAIT_MS,
  } = options;

  const results: ScreenshotResult[] = [];
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: viewportWidth, height: viewportHeight },
    });

    for (const route of routes) {
      const fileName = routeToFileName(route);
      const outputPath = `${outputDir}/${fileName}`;

      const result = await captureRouteWithPage(
        context,
        route,
        outputPath,
        baseUrl,
        waitAfterNav
      );
      results.push(result);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    /* If the browser itself failed to launch, mark remaining routes as failed */
    for (const route of routes) {
      const alreadyCaptured = results.some((r) => r.route === route);
      if (!alreadyCaptured) {
        results.push({
          route,
          filePath: `${outputDir}/${routeToFileName(route)}`,
          success: false,
          error: `Browser error: ${message}`,
        });
      }
    }
  } finally {
    await browser?.close();
  }

  return results;
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Capture a single route using an existing browser context.
 * Opens a new page, navigates, screenshots, and closes the page.
 */
async function captureRouteWithPage(
  context: Awaited<ReturnType<Browser['newContext']>>,
  route: string,
  outputPath: string,
  baseUrl: string,
  waitAfterNav: number
): Promise<ScreenshotResult> {
  let page: Page | undefined;

  try {
    page = await context.newPage();
    const url = buildUrl(baseUrl, route);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(waitAfterNav);

    await page.screenshot({ path: outputPath, fullPage: false });

    return { route, filePath: outputPath, success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { route, filePath: outputPath, success: false, error: message };
  } finally {
    await page?.close();
  }
}
