/**
 * Tier 2 E2E authentication helpers
 *
 * Uses real Supabase auth (not localStorage injection) to sign in
 * a dedicated test user. The test user must exist in the Supabase
 * project before running integration tests.
 *
 * Required env vars (see .env.e2e.example):
 *   E2E_TEST_USER_EMAIL    - Email of the pre-created test user
 *   E2E_TEST_USER_PASSWORD - Password of the pre-created test user
 *
 * Alternatively, tests can authenticate via the API's /api/auth/login
 * endpoint, which exercises the full auth middleware stack.
 */

import { getTestSupabase, API_BASE_URL } from '../env';

// =============================================================================
// Types
// =============================================================================

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}

// =============================================================================
// Supabase Direct Auth
// =============================================================================

/**
 * Sign in via the real Supabase Auth SDK.
 *
 * Returns tokens that can be used in Authorization headers for
 * subsequent API calls and in the browser via cookie/localStorage.
 *
 * Throws if credentials are missing or authentication fails.
 */
export async function signInTestUser(): Promise<AuthSession> {
  const email = process.env.E2E_TEST_USER_EMAIL;
  const password = process.env.E2E_TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set. ' +
        'Copy .env.e2e.example to .env.e2e and fill in the values.'
    );
  }

  const supabase = getTestSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(
      `Failed to sign in test user (${email}): ${error?.message ?? 'No session returned'}`
    );
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    userId: data.user.id,
    email: data.user.email ?? email,
  };
}

// =============================================================================
// API-Based Auth
// =============================================================================

/**
 * Sign in via POST /api/auth/login — exercises the full Express
 * middleware stack including CORS, rate limiting, and Supabase auth.
 *
 * Prefer this over direct Supabase auth when you need to verify
 * that the API's auth layer works end-to-end.
 */
export async function signInViaApi(): Promise<AuthSession> {
  const email = process.env.E2E_TEST_USER_EMAIL;
  const password = process.env.E2E_TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set. ' +
        'Copy .env.e2e.example to .env.e2e and fill in the values.'
    );
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `API login failed for ${email} (HTTP ${response.status}): ${body}`
    );
  }

  const { user, session } = await response.json();

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: user.id,
    email: user.email ?? email,
  };
}

// =============================================================================
// Sign Out
// =============================================================================

/**
 * Sign out the current test session.
 *
 * Best-effort cleanup — swallows errors so teardown never blocks.
 */
export async function signOutTestUser(): Promise<void> {
  try {
    const supabase = getTestSupabase();
    await supabase.auth.signOut();
  } catch {
    /* Teardown is best-effort */
  }
}
