/**
 * Tests for Supabase client singleton
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSupabase, checkSupabaseHealth, resetSupabaseClient } from './supabase.js';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) =>
        resolve({ data: null, error: null, count: 5 })
      ),
    })),
  })),
}));

describe('supabase service', () => {
  beforeEach(() => {
    // Reset the singleton before each test
    resetSupabaseClient();
    vi.clearAllMocks();
  });

  describe('getSupabase', () => {
    it('returns a Supabase client instance', () => {
      const client = getSupabase();
      expect(client).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('returns the same instance on subsequent calls (singleton)', () => {
      const client1 = getSupabase();
      const client2 = getSupabase();
      expect(client1).toBe(client2);
    });

    it('creates a new instance after reset', () => {
      const client1 = getSupabase();
      resetSupabaseClient();
      const client2 = getSupabase();
      // Both are mock objects, but they should be different instances
      expect(client1).not.toBe(client2);
    });
  });

  describe('checkSupabaseHealth', () => {
    it('returns connected: true when database query succeeds', async () => {
      const result = await checkSupabaseHealth();
      expect(result.connected).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('returns connected: false when database query fails', async () => {
      // Override the mock to return an error
      const { createClient } = await import('@supabase/supabase-js');
      vi.mocked(createClient).mockReturnValueOnce({
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          then: vi.fn((resolve) =>
            resolve({ data: null, error: { message: 'Connection failed' } })
          ),
        })),
      } as unknown as ReturnType<typeof createClient>);

      resetSupabaseClient();
      const result = await checkSupabaseHealth();
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection failed');
    });
  });

  describe('resetSupabaseClient', () => {
    it('resets the singleton so next call creates new instance', () => {
      const client1 = getSupabase();
      resetSupabaseClient();
      const client2 = getSupabase();
      expect(client1).not.toBe(client2);
    });
  });
});
