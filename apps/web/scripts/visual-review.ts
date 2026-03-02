#!/usr/bin/env npx tsx
/**
 * Visual Review CLI Script
 *
 * Captures screenshots at key Sage Codex routes for agent-driven
 * visual review (Section 7.6 of execute-issue.md). Outputs file paths
 * so the agent can read and analyze each screenshot with Claude vision.
 *
 * Usage:
 *   npx tsx apps/web/scripts/visual-review.ts
 *   npx tsx apps/web/scripts/visual-review.ts --base-url http://localhost:5173
 *   npx tsx apps/web/scripts/visual-review.ts --output-dir /tmp/screenshots
 *   npx tsx apps/web/scripts/visual-review.ts --routes /login,/adventure
 *
 * Prerequisites:
 *   - Dev server must be running (pnpm --filter web dev)
 *   - Playwright browsers must be installed (npx playwright install chromium)
 *
 * This is agent enablement — NOT automated visual regression testing.
 */

import { chromium } from '@playwright/test';
import {
  DEFAULT_BASE_URL,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_ROUTES,
  routeToFileName,
  buildUrl,
  type ScreenshotResult,
} from '../e2e-integration/helpers/screenshot-utils';

// =============================================================================
// Constants
// =============================================================================

const WAIT_AFTER_NAV_MS = 2000;
const SERVER_CHECK_TIMEOUT_MS = 5000;

// =============================================================================
// Types
// =============================================================================

interface CliOptions {
  baseUrl: string;
  outputDir: string;
  routes: string[];
  viewportWidth: number;
  viewportHeight: number;
}

// =============================================================================
// CLI Argument Parsing
// =============================================================================

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    baseUrl: DEFAULT_BASE_URL,
    outputDir: DEFAULT_OUTPUT_DIR,
    routes: [...DEFAULT_ROUTES],
    viewportWidth: DEFAULT_VIEWPORT_WIDTH,
    viewportHeight: DEFAULT_VIEWPORT_HEIGHT,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    if (arg === '--base-url' && nextArg) {
      options.baseUrl = nextArg;
      i++;
    } else if (arg === '--output-dir' && nextArg) {
      options.outputDir = nextArg;
      i++;
    } else if (arg === '--routes' && nextArg) {
      options.routes = nextArg.split(',').map((r) => r.trim());
      i++;
    } else if (arg === '--viewport' && nextArg) {
      const [width, height] = nextArg.split('x').map(Number);
      if (width && height) {
        options.viewportWidth = width;
        options.viewportHeight = height;
      }
      i++;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
  }

  return options;
}

function printUsage(): void {
  console.log(`
Visual Review CLI — Capture screenshots for agent-driven visual review

Usage:
  npx tsx apps/web/scripts/visual-review.ts [options]

Options:
  --base-url <url>      Dev server URL (default: ${DEFAULT_BASE_URL})
  --output-dir <dir>    Screenshot output directory (default: ${DEFAULT_OUTPUT_DIR})
  --routes <r1,r2,...>  Comma-separated routes (default: ${DEFAULT_ROUTES.join(',')})
  --viewport <WxH>      Viewport size (default: ${DEFAULT_VIEWPORT_WIDTH}x${DEFAULT_VIEWPORT_HEIGHT})
  --help, -h            Show this help message

Examples:
  npx tsx apps/web/scripts/visual-review.ts
  npx tsx apps/web/scripts/visual-review.ts --routes /login,/adventure
  npx tsx apps/web/scripts/visual-review.ts --output-dir ./screenshots --viewport 1920x1080
`);
}

// =============================================================================
// Server Health Check
// =============================================================================

async function checkDevServer(baseUrl: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    SERVER_CHECK_TIMEOUT_MS
  );

  try {
    const response = await fetch(baseUrl, { signal: controller.signal });
    return response.ok || response.status === 304;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// =============================================================================
// Screenshot Capture
// =============================================================================

async function captureAllRoutes(
  options: CliOptions
): Promise<ScreenshotResult[]> {
  const { baseUrl, outputDir, routes, viewportWidth, viewportHeight } = options;
  const results: ScreenshotResult[] = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
  });

  try {
    for (const route of routes) {
      const fileName = routeToFileName(route);
      const filePath = `${outputDir}/${fileName}`;
      const result = await captureRoute(context, baseUrl, route, filePath);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  return results;
}

async function captureRoute(
  context: Awaited<ReturnType<typeof chromium.launch extends () => Promise<infer B> ? B : never>['newContext']>,
  baseUrl: string,
  route: string,
  filePath: string
): Promise<ScreenshotResult> {
  const page = await context.newPage();

  try {
    const url = buildUrl(baseUrl, route);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(WAIT_AFTER_NAV_MS);
    await page.screenshot({ path: filePath, fullPage: false });

    return { route, filePath, success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { route, filePath, success: false, error: message };
  } finally {
    await page.close();
  }
}

// =============================================================================
// Output Formatting
// =============================================================================

function printResults(results: ScreenshotResult[]): void {
  console.log('\n--- Visual Review Screenshot Results ---\n');

  const successes = results.filter((r) => r.success);
  const failures = results.filter((r) => !r.success);

  for (const result of successes) {
    console.log(`  [OK]   ${result.route} -> ${result.filePath}`);
  }

  for (const result of failures) {
    console.log(`  [FAIL] ${result.route} -> ${result.error}`);
  }

  console.log(
    `\n  Total: ${results.length} | Passed: ${successes.length} | Failed: ${failures.length}`
  );

  if (successes.length > 0) {
    console.log('\n--- Screenshot File Paths (for agent consumption) ---\n');
    for (const result of successes) {
      console.log(result.filePath);
    }
  }

  console.log('');
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const options = parseArgs(process.argv);

  console.log(`Visual Review: Capturing ${options.routes.length} routes`);
  console.log(`  Base URL:   ${options.baseUrl}`);
  console.log(`  Output dir: ${options.outputDir}`);
  console.log(`  Viewport:   ${options.viewportWidth}x${options.viewportHeight}`);

  /* Verify dev server is reachable before launching browser */
  const isServerUp = await checkDevServer(options.baseUrl);

  if (!isServerUp) {
    console.error(
      `\nError: Dev server is not reachable at ${options.baseUrl}.\n` +
        'Start it with: pnpm --filter web dev\n'
    );
    process.exit(1);
  }

  const results = await captureAllRoutes(options);
  printResults(results);

  const hasFailures = results.some((r) => !r.success);
  process.exit(hasFailures ? 1 : 0);
}

main();
