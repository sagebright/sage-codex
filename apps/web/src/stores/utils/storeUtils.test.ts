/**
 * Store Utilities Tests
 *
 * Tests for reusable store utility functions to eliminate
 * repetitive patterns in contentStore and other stores.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  timestamp,
  addToSet,
  removeFromSet,
  confirmAllItems,
  applySearchFilter,
} from './storeUtils';

// =============================================================================
// timestamp() Tests
// =============================================================================

describe('timestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an ISO 8601 formatted string', () => {
    const result = timestamp();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });

  it('returns the current time', () => {
    const fixedDate = new Date('2024-06-15T10:30:00.000Z');
    vi.setSystemTime(fixedDate);

    const result = timestamp();
    expect(result).toBe('2024-06-15T10:30:00.000Z');
  });

  it('returns different values at different times', () => {
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    const first = timestamp();

    vi.setSystemTime(new Date('2024-01-01T00:00:01.000Z'));
    const second = timestamp();

    expect(first).not.toBe(second);
  });
});

// =============================================================================
// addToSet() Tests
// =============================================================================

describe('addToSet', () => {
  it('adds an item to an empty set', () => {
    const original = new Set<string>();
    const result = addToSet(original, 'item1');

    expect(result.has('item1')).toBe(true);
    expect(result.size).toBe(1);
  });

  it('adds an item to an existing set', () => {
    const original = new Set(['item1', 'item2']);
    const result = addToSet(original, 'item3');

    expect(result.has('item1')).toBe(true);
    expect(result.has('item2')).toBe(true);
    expect(result.has('item3')).toBe(true);
    expect(result.size).toBe(3);
  });

  it('does not mutate the original set', () => {
    const original = new Set(['item1']);
    addToSet(original, 'item2');

    expect(original.has('item2')).toBe(false);
    expect(original.size).toBe(1);
  });

  it('returns a new Set instance', () => {
    const original = new Set<string>();
    const result = addToSet(original, 'item1');

    expect(result).not.toBe(original);
  });

  it('handles duplicate items (no-op)', () => {
    const original = new Set(['item1', 'item2']);
    const result = addToSet(original, 'item1');

    expect(result.size).toBe(2);
    expect(result.has('item1')).toBe(true);
  });

  it('works with number types', () => {
    const original = new Set([1, 2, 3]);
    const result = addToSet(original, 4);

    expect(result.has(4)).toBe(true);
    expect(result.size).toBe(4);
  });
});

// =============================================================================
// removeFromSet() Tests
// =============================================================================

describe('removeFromSet', () => {
  it('removes an item from a set', () => {
    const original = new Set(['item1', 'item2', 'item3']);
    const result = removeFromSet(original, 'item2');

    expect(result.has('item2')).toBe(false);
    expect(result.size).toBe(2);
  });

  it('does not mutate the original set', () => {
    const original = new Set(['item1', 'item2']);
    removeFromSet(original, 'item1');

    expect(original.has('item1')).toBe(true);
    expect(original.size).toBe(2);
  });

  it('returns a new Set instance', () => {
    const original = new Set(['item1']);
    const result = removeFromSet(original, 'item1');

    expect(result).not.toBe(original);
  });

  it('handles removing non-existent item (no-op)', () => {
    const original = new Set(['item1', 'item2']);
    const result = removeFromSet(original, 'nonexistent');

    expect(result.size).toBe(2);
  });

  it('works with number types', () => {
    const original = new Set([1, 2, 3]);
    const result = removeFromSet(original, 2);

    expect(result.has(2)).toBe(false);
    expect(result.size).toBe(2);
  });

  it('returns empty set when removing last item', () => {
    const original = new Set(['item1']);
    const result = removeFromSet(original, 'item1');

    expect(result.size).toBe(0);
  });
});

// =============================================================================
// confirmAllItems() Tests
// =============================================================================

interface TestItem {
  id: string;
  name: string;
  isConfirmed?: boolean;
  updatedAt?: string;
}

describe('confirmAllItems', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T10:30:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marks all items as confirmed', () => {
    const items: TestItem[] = [
      { id: '1', name: 'Item 1', isConfirmed: false },
      { id: '2', name: 'Item 2', isConfirmed: false },
    ];

    const { updatedItems } = confirmAllItems(items, (item) => item.id);

    expect(updatedItems[0].isConfirmed).toBe(true);
    expect(updatedItems[1].isConfirmed).toBe(true);
  });

  it('sets updatedAt timestamp on all items', () => {
    const items: TestItem[] = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];

    const { updatedItems } = confirmAllItems(items, (item) => item.id);

    expect(updatedItems[0].updatedAt).toBe('2024-06-15T10:30:00.000Z');
    expect(updatedItems[1].updatedAt).toBe('2024-06-15T10:30:00.000Z');
  });

  it('returns Set of all item IDs', () => {
    const items: TestItem[] = [
      { id: 'a', name: 'Item A' },
      { id: 'b', name: 'Item B' },
      { id: 'c', name: 'Item C' },
    ];

    const { allIds } = confirmAllItems(items, (item) => item.id);

    expect(allIds.has('a')).toBe(true);
    expect(allIds.has('b')).toBe(true);
    expect(allIds.has('c')).toBe(true);
    expect(allIds.size).toBe(3);
  });

  it('preserves other item properties', () => {
    const items: TestItem[] = [
      { id: '1', name: 'Keep This Name', isConfirmed: false },
    ];

    const { updatedItems } = confirmAllItems(items, (item) => item.id);

    expect(updatedItems[0].name).toBe('Keep This Name');
    expect(updatedItems[0].id).toBe('1');
  });

  it('does not mutate original items', () => {
    const items: TestItem[] = [
      { id: '1', name: 'Item 1', isConfirmed: false },
    ];

    confirmAllItems(items, (item) => item.id);

    expect(items[0].isConfirmed).toBe(false);
  });

  it('handles empty array', () => {
    const items: TestItem[] = [];

    const { updatedItems, allIds } = confirmAllItems(items, (item) => item.id);

    expect(updatedItems).toHaveLength(0);
    expect(allIds.size).toBe(0);
  });

  it('works with custom ID extractors', () => {
    interface SelectedItem {
      item: { category: string; data: { name: string } };
      quantity: number;
    }

    const items: SelectedItem[] = [
      { item: { category: 'weapon', data: { name: 'Sword' } }, quantity: 1 },
      { item: { category: 'armor', data: { name: 'Shield' } }, quantity: 2 },
    ];

    const { allIds } = confirmAllItems(
      items,
      (si) => `${si.item.category}:${si.item.data.name}`
    );

    expect(allIds.has('weapon:Sword')).toBe(true);
    expect(allIds.has('armor:Shield')).toBe(true);
  });
});

// =============================================================================
// applySearchFilter() Tests
// =============================================================================

interface SearchableItem {
  name: string;
  description?: string;
  type?: string;
  tier?: number;
}

describe('applySearchFilter', () => {
  const testItems: SearchableItem[] = [
    { name: 'Fire Dragon', description: 'A fierce dragon', type: 'beast', tier: 3 },
    { name: 'Ice Elemental', description: 'Cold spirit', type: 'elemental', tier: 2 },
    { name: 'Shadow Assassin', description: 'Sneaky fighter', type: 'humanoid', tier: 1 },
    { name: 'Fire Spirit', description: 'Burning apparition', type: 'elemental', tier: 2 },
  ];

  it('filters by search term in name (case insensitive)', () => {
    const result = applySearchFilter(testItems, 'fire', ['name']);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Fire Dragon');
    expect(result[1].name).toBe('Fire Spirit');
  });

  it('filters by search term in description', () => {
    const result = applySearchFilter(testItems, 'dragon', ['name', 'description']);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Fire Dragon');
  });

  it('filters by search term in multiple fields', () => {
    const result = applySearchFilter(testItems, 'elemental', ['name', 'type']);

    expect(result).toHaveLength(2);
    expect(result.map((i) => i.name)).toContain('Ice Elemental');
    expect(result.map((i) => i.name)).toContain('Fire Spirit');
  });

  it('returns all items when search term is empty', () => {
    const result = applySearchFilter(testItems, '', ['name']);

    expect(result).toHaveLength(4);
  });

  it('returns all items when search term is undefined', () => {
    const result = applySearchFilter(testItems, undefined, ['name']);

    expect(result).toHaveLength(4);
  });

  it('is case insensitive', () => {
    const result = applySearchFilter(testItems, 'FIRE', ['name']);

    expect(result).toHaveLength(2);
  });

  it('does not mutate original array', () => {
    const original = [...testItems];
    applySearchFilter(testItems, 'fire', ['name']);

    expect(testItems).toEqual(original);
  });

  it('returns empty array when no matches found', () => {
    const result = applySearchFilter(testItems, 'nonexistent', ['name', 'description', 'type']);

    expect(result).toHaveLength(0);
  });

  it('handles items with undefined fields gracefully', () => {
    const itemsWithUndefined: SearchableItem[] = [
      { name: 'Item 1', description: undefined },
      { name: 'Item 2', description: 'Has description' },
    ];

    const result = applySearchFilter(itemsWithUndefined, 'description', ['name', 'description']);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Item 2');
  });

  it('trims whitespace from search term', () => {
    const result = applySearchFilter(testItems, '  fire  ', ['name']);

    expect(result).toHaveLength(2);
  });
});
