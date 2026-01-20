/**
 * Vitest setup file for web app tests
 *
 * Provides:
 * - localStorage mock with vi.fn() for assertion tracking
 * - crypto.randomUUID mock for deterministic test IDs
 * - React testing cleanup
 * - jest-dom matchers
 */

import { cleanup } from '@testing-library/react';
import { afterEach, vi, type Mock } from 'vitest';
import '@testing-library/jest-dom/vitest';

// =============================================================================
// React Cleanup
// =============================================================================

// Automatically clean up after each test
afterEach(() => {
  cleanup();
});

// =============================================================================
// localStorage Mock
// =============================================================================

interface StorageMock {
  store: Record<string, string>;
  getItem: Mock<(key: string) => string | null>;
  setItem: Mock<(key: string, value: string) => void>;
  removeItem: Mock<(key: string) => void>;
  clear: Mock<() => void>;
  key: Mock<(index: number) => string | null>;
  length: number;
}

const createLocalStorageMock = (): StorageMock => {
  let store: Record<string, string> = {};

  const clearFn = vi.fn((): void => {
    store = {};
    mock.store = store;
  });

  const mock: StorageMock = {
    store,
    getItem: vi.fn((key: string): string | null => {
      return store[key] ?? null;
    }),
    setItem: vi.fn((key: string, value: string): void => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string): void => {
      delete store[key];
    }),
    clear: clearFn,
    key: vi.fn((index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    }),
    get length() {
      return Object.keys(store).length;
    },
  };

  return mock;
};

const localStorageMock = createLocalStorageMock();

// Replace global localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Export for use in tests
export { localStorageMock };

// =============================================================================
// crypto.randomUUID Mock
// =============================================================================

let uuidCounter = 0;

const randomUUIDMock = vi.fn((): string => {
  uuidCounter += 1;
  return `test-uuid-${uuidCounter.toString().padStart(4, '0')}`;
});

// Reset counter between tests
afterEach(() => {
  uuidCounter = 0;
});

// Mock crypto.randomUUID
Object.defineProperty(globalThis, 'crypto', {
  value: {
    ...globalThis.crypto,
    randomUUID: randomUUIDMock,
  },
  writable: true,
});

// Export for use in tests
export { randomUUIDMock };

// =============================================================================
// Reset Mocks Between Tests
// =============================================================================

afterEach(() => {
  // Clear localStorage mock store and reset mock call tracking
  localStorageMock.store = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Clear randomUUID mock
  randomUUIDMock.mockClear();
});
