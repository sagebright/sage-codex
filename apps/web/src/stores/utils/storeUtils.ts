/**
 * Store Utilities
 *
 * Reusable utility functions for Zustand stores to eliminate
 * repetitive patterns (timestamps, Set operations, confirmAll helpers).
 */

// =============================================================================
// Timestamp Utility
// =============================================================================

/**
 * Returns the current timestamp in ISO 8601 format.
 * Replaces repetitive `new Date().toISOString()` calls throughout stores.
 *
 * @returns ISO 8601 formatted timestamp string
 *
 * @example
 * const now = timestamp(); // "2024-06-15T10:30:00.000Z"
 */
export function timestamp(): string {
  return new Date().toISOString();
}

// =============================================================================
// Set Operation Utilities
// =============================================================================

/**
 * Creates a new Set with an item added.
 * Does not mutate the original Set.
 *
 * @param original - The original Set
 * @param item - Item to add
 * @returns New Set with the item added
 *
 * @example
 * const ids = new Set(['a', 'b']);
 * const updated = addToSet(ids, 'c'); // Set(['a', 'b', 'c'])
 */
export function addToSet<T>(original: Set<T>, item: T): Set<T> {
  const newSet = new Set(original);
  newSet.add(item);
  return newSet;
}

/**
 * Creates a new Set with an item removed.
 * Does not mutate the original Set.
 *
 * @param original - The original Set
 * @param item - Item to remove
 * @returns New Set with the item removed
 *
 * @example
 * const ids = new Set(['a', 'b', 'c']);
 * const updated = removeFromSet(ids, 'b'); // Set(['a', 'c'])
 */
export function removeFromSet<T>(original: Set<T>, item: T): Set<T> {
  const newSet = new Set(original);
  newSet.delete(item);
  return newSet;
}

// =============================================================================
// Confirm All Items Utility
// =============================================================================

/**
 * Result of confirmAllItems operation
 */
export interface ConfirmAllResult<T> {
  /** Updated items with isConfirmed: true and updatedAt timestamp */
  updatedItems: (T & { isConfirmed: boolean; updatedAt: string })[];
  /** Set of all item IDs */
  allIds: Set<string>;
}

/**
 * Confirms all items by setting isConfirmed to true and adding updatedAt timestamp.
 * Returns updated items and a Set of all IDs.
 * Does not mutate the original items.
 *
 * @param items - Array of items to confirm
 * @param idExtractor - Function to extract ID from each item
 * @returns Object containing updated items and Set of all IDs
 *
 * @example
 * const npcs = [{ id: '1', name: 'Bob' }, { id: '2', name: 'Alice' }];
 * const { updatedItems, allIds } = confirmAllItems(npcs, (n) => n.id);
 * // updatedItems: [{ id: '1', name: 'Bob', isConfirmed: true, updatedAt: '...' }, ...]
 * // allIds: Set(['1', '2'])
 */
export function confirmAllItems<T>(
  items: T[],
  idExtractor: (item: T) => string
): ConfirmAllResult<T> {
  const now = timestamp();

  const updatedItems = items.map((item) => ({
    ...item,
    isConfirmed: true,
    updatedAt: now,
  }));

  const allIds = new Set(items.map(idExtractor));

  return { updatedItems, allIds };
}

// =============================================================================
// Search Filter Utility
// =============================================================================

/**
 * Filters items by a search term across specified fields.
 * Case-insensitive matching. Returns all items if search term is empty/undefined.
 *
 * @param items - Array of items to filter
 * @param searchTerm - Search term (can be empty or undefined)
 * @param fields - Array of field names to search in
 * @returns Filtered array of items
 *
 * @example
 * const adversaries = [
 *   { name: 'Fire Dragon', type: 'beast' },
 *   { name: 'Ice Golem', type: 'elemental' }
 * ];
 * const filtered = applySearchFilter(adversaries, 'fire', ['name', 'type']);
 * // [{ name: 'Fire Dragon', type: 'beast' }]
 */
export function applySearchFilter<T>(
  items: T[],
  searchTerm: string | undefined,
  fields: (keyof T)[]
): T[] {
  const trimmedTerm = searchTerm?.trim().toLowerCase();

  if (!trimmedTerm) {
    return items;
  }

  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(trimmedTerm);
      }
      return false;
    })
  );
}
