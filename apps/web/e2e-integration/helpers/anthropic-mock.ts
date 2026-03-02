/**
 * Anthropic SDK mock for Tier 2 integration tests
 *
 * Intercepts chat endpoints at the Playwright route level so the real
 * Express routing, auth middleware, and Supabase persistence all execute
 * normally -- only the Anthropic API call is replaced with a deterministic
 * SSE response.
 *
 * Strategy:
 * The API server streams Anthropic responses through POST /api/chat and
 * POST /api/chat/greet. This module uses Playwright's page.route() to
 * intercept those requests and return pre-built SSE bodies, giving tests
 * full control over the "AI" responses.
 *
 * For deeper API-layer mocking (e.g., setting ANTHROPIC_API_KEY to a
 * test sentinel so the server skips real SDK calls), see the env.ts
 * configuration and .env.e2e.example.
 */

import type { Page, Route } from '@playwright/test';

// =============================================================================
// Constants
// =============================================================================

const SSE_HEADERS: Record<string, string> = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

// =============================================================================
// Types
// =============================================================================

export interface AnthropicMockController {
  /** Replace the SSE body returned by POST /api/chat */
  setChatResponse: (body: string) => void;
  /** Replace the SSE body returned by POST /api/chat/greet */
  setGreetResponse: (body: string) => void;
  /** Tear down route interception (call in afterEach) */
  dispose: () => Promise<void>;
}

// =============================================================================
// SSE Body Builder
// =============================================================================

/**
 * Build a minimal SSE body with a single text response.
 *
 * Produces the same event sequence the real API emits:
 *   chat:start -> chat:delta -> chat:end
 *
 * For tool-call responses, callers should construct the SSE body
 * manually using the event format from shared-types/sage-events.ts.
 */
export function buildSimpleSSE(text: string): string {
  const messageId = `msg_e2e_${Date.now()}`;
  const lines = [
    `event: chat:start\ndata: ${JSON.stringify({ messageId })}\n`,
    `event: chat:delta\ndata: ${JSON.stringify({ messageId, content: text })}\n`,
    `event: chat:end\ndata: ${JSON.stringify({ messageId, inputTokens: 10, outputTokens: 5 })}\n`,
  ];
  return lines.join('\n');
}

// =============================================================================
// Route Interception
// =============================================================================

/**
 * Install Playwright route handlers that intercept Anthropic-dependent
 * endpoints and return deterministic SSE responses.
 *
 * Returns a controller that lets each test swap the response body
 * between interactions (e.g., switch from invoking to attuning).
 *
 * Usage:
 *   const mock = await installAnthropicMock(page);
 *   mock.setChatResponse(buildSimpleSSE('Hello from the Sage'));
 *   // ... interact with page ...
 *   await mock.dispose();
 */
export async function installAnthropicMock(
  page: Page,
  options: { initialChatBody?: string; initialGreetBody?: string } = {}
): Promise<AnthropicMockController> {
  let chatBody =
    options.initialChatBody ?? buildSimpleSSE('Mock Sage response.');
  let greetBody =
    options.initialGreetBody ?? buildSimpleSSE('Welcome, storyteller.');

  const chatHandler = async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: SSE_HEADERS,
      body: chatBody,
    });
  };

  const greetHandler = async (route: Route) => {
    await route.fulfill({
      status: 200,
      headers: SSE_HEADERS,
      body: greetBody,
    });
  };

  /* Install route handlers — greet first (more specific) */
  await page.route('**/api/chat/greet', greetHandler);
  await page.route('**/api/chat', chatHandler);

  return {
    setChatResponse: (body) => {
      chatBody = body;
    },
    setGreetResponse: (body) => {
      greetBody = body;
    },
    dispose: async () => {
      await page.unroute('**/api/chat/greet', greetHandler);
      await page.unroute('**/api/chat', chatHandler);
    },
  };
}
