/**
 * Zustand Store Testing Utilities
 *
 * Provides helpers for testing Zustand stores with persist middleware:
 * - Store state reset utilities
 * - Persistence simulation helpers
 * - State verification utilities
 */

import { act } from '@testing-library/react';
import type { StoreApi } from 'zustand';

// =============================================================================
// Types
// =============================================================================

/**
 * Generic store type with getState/setState
 */
type ZustandStore<T> = StoreApi<T> & {
  persist?: {
    clearStorage: () => void;
    rehydrate: () => Promise<void> | void;
    hasHydrated: () => boolean;
  };
};

// =============================================================================
// Store Reset Utilities
// =============================================================================

/**
 * Reset a store to its initial state by calling its reset action
 * Assumes store has a `reset` action in its state
 */
export function resetStore<T extends { reset?: () => void }>(
  store: ZustandStore<T>
): void {
  const state = store.getState();
  if (state.reset) {
    act(() => {
      state.reset?.();
    });
  }
}

/**
 * Reset a store by setting state directly
 * Useful when store doesn't have a reset action
 */
export function resetStoreState<T>(
  store: ZustandStore<T>,
  initialState: Partial<T>
): void {
  act(() => {
    store.setState(initialState as T, true);
  });
}

// =============================================================================
// Persistence Utilities
// =============================================================================

/**
 * Clear persisted storage for a store
 * @param storageKey - The key used in localStorage
 */
export function clearPersistedStorage(storageKey: string): void {
  localStorage.removeItem(storageKey);
}

/**
 * Get the persisted state from localStorage
 * @param storageKey - The key used in localStorage
 */
export function getPersistedState<T>(storageKey: string): T | null {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.state as T;
  } catch {
    return null;
  }
}

/**
 * Set persisted state directly in localStorage
 * Useful for testing rehydration
 */
export function setPersistedState<T>(storageKey: string, state: T): void {
  const data = {
    state,
    version: 0,
  };
  localStorage.setItem(storageKey, JSON.stringify(data));
}

// =============================================================================
// State Verification Utilities
// =============================================================================

/**
 * Wait for store to update and return current state
 */
export async function waitForStoreUpdate<T>(
  store: ZustandStore<T>,
  timeout = 100
): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(store.getState());
    }, timeout);
  });
}

/**
 * Execute an action within act() wrapper
 */
export function storeAction<R>(action: () => R): R {
  let result: R;
  act(() => {
    result = action();
  });
  return result!;
}

// =============================================================================
// Date Serialization Test Helpers
// =============================================================================

/**
 * Verify Date serialization roundtrip
 * Tests that a Date is properly serialized to ISO string and back
 */
export function verifyDateSerialization(
  storageKey: string,
  statePath: string
): boolean {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return false;

  try {
    const parsed = JSON.parse(stored);
    const pathParts = statePath.split('.');
    let value = parsed.state;

    for (const part of pathParts) {
      value = value?.[part];
    }

    // Should be stored as ISO string, not Date object
    return typeof value === 'string' && !isNaN(Date.parse(value));
  } catch {
    return false;
  }
}

// =============================================================================
// Set Serialization Test Helpers
// =============================================================================

/**
 * Verify Set serialization roundtrip
 * Tests that a Set is properly serialized to Array and back
 */
export function verifySetSerialization(
  storageKey: string,
  statePath: string
): boolean {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return false;

  try {
    const parsed = JSON.parse(stored);
    const pathParts = statePath.split('.');
    let value = parsed.state;

    for (const part of pathParts) {
      value = value?.[part];
    }

    // Should be stored as Array, not Set
    return Array.isArray(value);
  } catch {
    return false;
  }
}
