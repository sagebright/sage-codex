/**
 * Tier 2 E2E environment configuration
 *
 * Provides a pre-configured Supabase client for integration tests.
 * Reads connection details from E2E-specific environment variables
 * so tests never accidentally touch production data.
 *
 * Required env vars (see .env.e2e.example):
 *   E2E_SUPABASE_URL      - Supabase project URL
 *   E2E_SUPABASE_ANON_KEY - Supabase anonymous/public key
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// Constants
// =============================================================================

const API_PORT = process.env.API_PORT ?? '3001';

/** Base URL for the API server used in integration tests */
export const API_BASE_URL = `http://localhost:${API_PORT}`;

// =============================================================================
// Supabase Client
// =============================================================================

/**
 * Create a Supabase client configured for E2E tests.
 *
 * Throws immediately if the required environment variables are missing,
 * preventing cryptic runtime errors deep inside test helpers.
 */
export function getTestSupabase(): SupabaseClient {
  const url = process.env.E2E_SUPABASE_URL;
  const anonKey = process.env.E2E_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      'E2E_SUPABASE_URL is not set. ' +
        'Copy .env.e2e.example to .env.e2e and fill in the values.'
    );
  }

  if (!anonKey) {
    throw new Error(
      'E2E_SUPABASE_ANON_KEY is not set. ' +
        'Copy .env.e2e.example to .env.e2e and fill in the values.'
    );
  }

  return createClient(url, anonKey);
}
