/**
 * Unit tests for screenshot utility pure functions
 *
 * Tests routeToFileName and buildUrl from the screenshot-utils module.
 * These are extracted into a Playwright-free module so they can run
 * in vitest's jsdom environment.
 *
 * Full capture behavior is validated via Playwright integration (manual).
 */

import { describe, it, expect } from 'vitest';
import {
  routeToFileName,
  buildUrl,
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  DEFAULT_BASE_URL,
  DEFAULT_OUTPUT_DIR,
  DEFAULT_ROUTES,
} from '../../e2e-integration/helpers/screenshot-utils';

// =============================================================================
// routeToFileName
// =============================================================================

describe('routeToFileName', () => {
  it('converts root route to screenshot-root.png', () => {
    expect(routeToFileName('/')).toBe('screenshot-root.png');
  });

  it('converts simple route to hyphenated file name', () => {
    expect(routeToFileName('/login')).toBe('screenshot-login.png');
  });

  it('converts /adventure route correctly', () => {
    expect(routeToFileName('/adventure')).toBe('screenshot-adventure.png');
  });

  it('converts nested route with hyphens', () => {
    expect(routeToFileName('/design-system')).toBe(
      'screenshot-design-system.png'
    );
  });

  it('converts deeply nested route to hyphenated name', () => {
    expect(routeToFileName('/adventure/stages/invoking')).toBe(
      'screenshot-adventure-stages-invoking.png'
    );
  });

  it('handles route without leading slash', () => {
    expect(routeToFileName('settings')).toBe('screenshot-settings.png');
  });

  it('handles empty string as root', () => {
    expect(routeToFileName('')).toBe('screenshot-root.png');
  });

  it('strips trailing slashes', () => {
    expect(routeToFileName('/login/')).toBe('screenshot-login.png');
  });
});

// =============================================================================
// buildUrl
// =============================================================================

describe('buildUrl', () => {
  it('combines base URL and route path', () => {
    expect(buildUrl('http://localhost:5173', '/login')).toBe(
      'http://localhost:5173/login'
    );
  });

  it('strips trailing slash from base URL', () => {
    expect(buildUrl('http://localhost:5173/', '/login')).toBe(
      'http://localhost:5173/login'
    );
  });

  it('adds leading slash to route if missing', () => {
    expect(buildUrl('http://localhost:5173', 'login')).toBe(
      'http://localhost:5173/login'
    );
  });

  it('handles root route', () => {
    expect(buildUrl('http://localhost:5173', '/')).toBe(
      'http://localhost:5173/'
    );
  });

  it('works with custom port', () => {
    expect(buildUrl('http://localhost:3000', '/adventure')).toBe(
      'http://localhost:3000/adventure'
    );
  });
});

// =============================================================================
// Constants
// =============================================================================

describe('screenshot constants', () => {
  it('has standard viewport dimensions', () => {
    expect(DEFAULT_VIEWPORT_WIDTH).toBe(1280);
    expect(DEFAULT_VIEWPORT_HEIGHT).toBe(720);
  });

  it('has expected base URL', () => {
    expect(DEFAULT_BASE_URL).toBe('http://localhost:5173');
  });

  it('has /tmp as default output directory', () => {
    expect(DEFAULT_OUTPUT_DIR).toBe('/tmp');
  });

  it('includes at least 4 default routes', () => {
    expect(DEFAULT_ROUTES.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_ROUTES).toContain('/login');
    expect(DEFAULT_ROUTES).toContain('/');
    expect(DEFAULT_ROUTES).toContain('/adventure');
  });
});
