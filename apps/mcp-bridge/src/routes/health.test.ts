/**
 * Integration tests for health route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../test/express-utils.js';

// Mock the supabase service
vi.mock('../services/supabase.js', () => ({
  checkSupabaseHealth: vi.fn(),
  getSupabase: vi.fn(),
  resetSupabaseClient: vi.fn(),
}));

// Import after mocking
import { checkSupabaseHealth } from '../services/supabase.js';

describe('GET /health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with status ok when database is connected', async () => {
    vi.mocked(checkSupabaseHealth).mockResolvedValue({
      connected: true,
      latencyMs: 42,
    });

    const app = createTestApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.database.connected).toBe(true);
    expect(response.body.database.latencyMs).toBe(42);
    expect(response.body.timestamp).toBeDefined();
  });

  it('returns 503 with status error when database is not connected', async () => {
    vi.mocked(checkSupabaseHealth).mockResolvedValue({
      connected: false,
      error: 'Connection refused',
    });

    const app = createTestApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.database.connected).toBe(false);
    expect(response.body.database.error).toBe('Connection refused');
  });

  it('includes timestamp in ISO format', async () => {
    vi.mocked(checkSupabaseHealth).mockResolvedValue({
      connected: true,
      latencyMs: 10,
    });

    const app = createTestApp();
    const response = await request(app).get('/health');

    expect(response.body.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
  });

  it('returns JSON content type', async () => {
    vi.mocked(checkSupabaseHealth).mockResolvedValue({
      connected: true,
      latencyMs: 10,
    });

    const app = createTestApp();
    const response = await request(app).get('/health');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});
