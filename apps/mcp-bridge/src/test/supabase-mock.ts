/**
 * Supabase mock utilities for testing
 *
 * Provides chainable query builder mocks that match the Supabase client API.
 * Use these to mock database responses without hitting a real database.
 */

import { vi } from 'vitest';

/**
 * Query result type for mocked responses
 */
export interface MockQueryResult<T = unknown> {
  data: T | null;
  error: { message: string; code: string } | null;
  count?: number;
}

/**
 * Creates a chainable query builder mock
 *
 * Supports the common Supabase query patterns:
 * - .from('table').select('*')
 * - .from('table').select('id', { count: 'exact', head: true })
 * - .from('table').select().eq('column', value)
 * - .from('table').select().limit(n)
 */
export function createMockQueryBuilder<T = unknown>(
  result: MockQueryResult<T>
): ChainableQueryBuilder<T> {
  const builder: ChainableQueryBuilder<T> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    // Terminal method that returns the result
    then: vi.fn((resolve) => resolve(result)),
  };

  // Make the builder itself return a promise when awaited
  Object.defineProperty(builder, 'then', {
    value: (resolve: (value: MockQueryResult<T>) => void) => {
      resolve(result);
      return Promise.resolve(result);
    },
  });

  return builder;
}

/**
 * Chainable query builder interface matching Supabase patterns
 */
export interface ChainableQueryBuilder<T = unknown> {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  gt: ReturnType<typeof vi.fn>;
  gte: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  lte: ReturnType<typeof vi.fn>;
  like: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  is: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  contains: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
  then: (resolve: (value: MockQueryResult<T>) => void) => Promise<MockQueryResult<T>>;
}

/**
 * Creates a mock Supabase client with configurable responses
 *
 * @example
 * ```ts
 * const mockClient = createMockSupabaseClient({
 *   'daggerheart_frames': { data: [{ id: 1, name: 'Test' }], error: null }
 * });
 *
 * vi.mocked(getSupabase).mockReturnValue(mockClient);
 * ```
 */
export function createMockSupabaseClient(
  tableResponses: Record<string, MockQueryResult> = {}
): MockSupabaseClient {
  return {
    from: vi.fn((tableName: string) => {
      const response = tableResponses[tableName] ?? { data: null, error: null };
      return createMockQueryBuilder(response);
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    },
  };
}

/**
 * Mock Supabase client interface
 */
export interface MockSupabaseClient {
  from: ReturnType<typeof vi.fn>;
  auth: {
    getUser: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
  };
  storage: {
    from: ReturnType<typeof vi.fn>;
  };
}

/**
 * Helper to create a successful query result
 */
export function mockSuccess<T>(data: T, count?: number): MockQueryResult<T> {
  return { data, error: null, count };
}

/**
 * Helper to create a failed query result
 */
export function mockError(message: string, code = 'UNKNOWN'): MockQueryResult<null> {
  return { data: null, error: { message, code } };
}
