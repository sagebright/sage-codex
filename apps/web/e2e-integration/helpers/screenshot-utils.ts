/**
 * Pure utility functions for screenshot file naming and URL building.
 *
 * Extracted from screenshot.ts so these can be unit-tested in vitest
 * (jsdom environment) without importing Playwright.
 */

// =============================================================================
// Constants
// =============================================================================

export const DEFAULT_VIEWPORT_WIDTH = 1280;
export const DEFAULT_VIEWPORT_HEIGHT = 720;
export const DEFAULT_WAIT_MS = 2000;
export const DEFAULT_BASE_URL = 'http://localhost:5173';
export const DEFAULT_OUTPUT_DIR = '/tmp';

/**
 * Key adventure routes for visual review.
 * Covers login, dashboard, adventure page, and the design system.
 */
export const DEFAULT_ROUTES = [
  '/login',
  '/',
  '/adventure',
  '/design-system',
] as const;

// =============================================================================
// Types
// =============================================================================

export interface ScreenshotOptions {
  /** Route path to navigate to (e.g., '/login', '/adventure') */
  route: string;
  /** Output file path for the screenshot PNG */
  outputPath: string;
  /** Viewport width in pixels (default: 1280) */
  viewportWidth?: number;
  /** Viewport height in pixels (default: 720) */
  viewportHeight?: number;
  /** Base URL of the running dev server (default: http://localhost:5173) */
  baseUrl?: string;
  /** Milliseconds to wait after navigation before capturing (default: 2000) */
  waitAfterNav?: number;
}

export interface ScreenshotResult {
  /** Route that was captured */
  route: string;
  /** Absolute file path of the saved screenshot */
  filePath: string;
  /** Whether the capture succeeded */
  success: boolean;
  /** Error message if capture failed */
  error?: string;
}

export interface BatchScreenshotOptions {
  /** Routes to capture */
  routes: string[];
  /** Base URL of the running dev server (default: http://localhost:5173) */
  baseUrl?: string;
  /** Output directory for screenshots (default: /tmp) */
  outputDir?: string;
  /** Viewport width (default: 1280) */
  viewportWidth?: number;
  /** Viewport height (default: 720) */
  viewportHeight?: number;
  /** Milliseconds to wait after each navigation (default: 2000) */
  waitAfterNav?: number;
}

// =============================================================================
// Pure Utilities
// =============================================================================

/**
 * Convert a route path to a safe file name.
 * '/' becomes 'screenshot-root.png', '/login' becomes 'screenshot-login.png'.
 */
export function routeToFileName(route: string): string {
  const trimmed = route.replace(/^\/+|\/+$/g, '');
  const safeName = trimmed === '' ? 'root' : trimmed.replace(/\//g, '-');
  return `screenshot-${safeName}.png`;
}

/**
 * Build a full URL from a base URL and route path.
 */
export function buildUrl(baseUrl: string, route: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  const path = route.startsWith('/') ? route : `/${route}`;
  return `${base}${path}`;
}
