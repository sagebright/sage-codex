/**
 * Test data helpers for Tier 2 integration tests
 *
 * Creates and deletes test sessions and adventure state through the
 * real API endpoints (POST /api/session, DELETE /api/session/:id),
 * NOT via direct Supabase inserts. This ensures tests exercise the
 * same validation and business logic that production traffic uses.
 *
 * DB schema reference:
 *   sage_sessions:        stage, is_active boolean
 *   sage_adventure_state: frame, components JSONB, state JSONB
 *   sage_messages:        id, session_id, role, content, metadata, created_at
 */

import { API_BASE_URL } from '../env';

// =============================================================================
// Types
// =============================================================================

interface SessionResponse {
  session: {
    id: string;
    user_id: string;
    title: string;
    stage: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  adventureState: {
    id: string;
    session_id: string;
    state: Record<string, unknown>;
    components: Record<string, unknown>;
    frame: unknown;
    outline: unknown;
    scenes: unknown[];
  };
}

interface CreateSessionOptions {
  title?: string;
  accessToken: string;
}

interface DeleteSessionOptions {
  sessionId: string;
  accessToken: string;
}

// =============================================================================
// Create Session
// =============================================================================

/**
 * Create a new test session via POST /api/session.
 *
 * Returns the full session + adventure state response from the API.
 * Throws on network or HTTP errors so tests fail fast with clear messages.
 */
export async function createTestSession(
  options: CreateSessionOptions
): Promise<SessionResponse> {
  const { title = 'E2E Integration Test Session', accessToken } = options;

  const response = await fetch(`${API_BASE_URL}/api/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to create test session (HTTP ${response.status}): ${body}`
    );
  }

  return response.json() as Promise<SessionResponse>;
}

// =============================================================================
// Delete Session
// =============================================================================

/**
 * Delete (abandon) a test session via DELETE /api/session/:id.
 *
 * Silently succeeds if the session is already gone (404),
 * since teardown should be idempotent.
 */
export async function deleteTestSession(
  options: DeleteSessionOptions
): Promise<void> {
  const { sessionId, accessToken } = options;

  const response = await fetch(
    `${API_BASE_URL}/api/session/${sessionId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  /* 404 is acceptable during teardown — session may already be gone */
  if (!response.ok && response.status !== 404) {
    const body = await response.text();
    throw new Error(
      `Failed to delete test session ${sessionId} (HTTP ${response.status}): ${body}`
    );
  }
}

// =============================================================================
// Load Session
// =============================================================================

/**
 * Load an existing test session via GET /api/session/:id.
 *
 * Useful for asserting that server-side state matches expectations
 * after a sequence of UI interactions.
 */
export async function loadTestSession(
  sessionId: string,
  accessToken: string
): Promise<SessionResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/session/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to load test session ${sessionId} (HTTP ${response.status}): ${body}`
    );
  }

  return response.json() as Promise<SessionResponse>;
}
