/**
 * ItemSelector Component
 *
 * Displays the list of available items with:
 * - Filter bar (tier, category, search)
 * - Item cards with selection and quantity controls
 * - Selected items sidebar
 * - Progress tracking
 * - Confirm all and proceed actions
 * Fantasy-themed styling consistent with other content panels.
 */

import { useCallback, useMemo, useState } from 'react';
import type {
  UnifiedItem,
  SelectedItem,
  ItemFilterOptions,
  ItemCategory,
} from '@dagger-app/shared-types';
import { ItemCard } from './ItemCard';

// =============================================================================
// Props
// =============================================================================

export interface ItemSelectorProps {
  /** Available items from Supabase (unified) */
  items: UnifiedItem[];
  /** Currently selected items with quantities */
  selectedItems: SelectedItem[];
  /** Set of confirmed item keys (category:id) */
  confirmedItemIds?: Set<string>;
  /** Available categories for filtering */
  availableCategories: ItemCategory[];
  /** Current party tier (1-4) for default filtering */
  partyTier: 1 | 2 | 3 | 4;
  /** Whether items are loading */
  isLoading?: boolean;
  /** Error message if loading failed */
  error?: string | null;
  /** Callback when an item is selected */
  onSelect: (item: UnifiedItem) => void;
  /** Callback when an item is deselected */
  onDeselect: (itemId: string, category: ItemCategory) => void;
  /** Callback when quantity changes */
  onQuantityChange: (itemId: string, category: ItemCategory, quantity: number) => void;
  /** Callback when an item is confirmed */
  onConfirm: (itemId: string, category: ItemCategory) => void;
  /** Callback when all items are confirmed */
  onConfirmAll: () => void;
  /** Callback when user proceeds to next phase */
  onProceed: () => void;
  /** Callback when filter changes */
  onFilterChange: (filters: ItemFilterOptions) => void;
  /** Callback for retry on error */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ItemSelector({
  items,
  selectedItems,
  confirmedItemIds = new Set(),
  availableCategories,
  partyTier,
  isLoading = false,
  error = null,
  onSelect,
  onDeselect,
  onQuantityChange,
  onConfirm,
  onConfirmAll,
  onProceed,
  onFilterChange,
  onRetry,
  className = '',
}: ItemSelectorProps) {
  // Local filter state
  const [tierFilter, setTierFilter] = useState<number | undefined>(partyTier);
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Apply filters
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by tier (only applies to weapons/armor)
    if (tierFilter !== undefined) {
      filtered = filtered.filter((item) => {
        if (item.category === 'weapon') {
          return item.data.tier === tierFilter;
        }
        if (item.category === 'armor') {
          return item.data.tier === tierFilter;
        }
        // Items and consumables don't have tiers, include them all
        return true;
      });
    }

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        if (item.data.name.toLowerCase().includes(term)) return true;
        // Check description for items and consumables
        if ((item.category === 'item' || item.category === 'consumable') &&
            item.data.description?.toLowerCase().includes(term)) {
          return true;
        }
        // Check weapon category for weapons
        if (item.category === 'weapon' &&
            item.data.weapon_category?.toLowerCase().includes(term)) {
          return true;
        }
        return false;
      });
    }

    return filtered;
  }, [items, tierFilter, categoryFilter, searchTerm]);

  // Handle filter changes
  const handleTierChange = useCallback(
    (tier: number | undefined) => {
      setTierFilter(tier);
      onFilterChange({ tier, category: categoryFilter || undefined, searchTerm: searchTerm || undefined });
    },
    [categoryFilter, searchTerm, onFilterChange]
  );

  const handleCategoryChange = useCallback(
    (category: ItemCategory | '') => {
      setCategoryFilter(category);
      onFilterChange({ tier: tierFilter, category: category || undefined, searchTerm: searchTerm || undefined });
    },
    [tierFilter, searchTerm, onFilterChange]
  );

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term);
      onFilterChange({ tier: tierFilter, category: categoryFilter || undefined, searchTerm: term || undefined });
    },
    [tierFilter, categoryFilter, onFilterChange]
  );

  const handleResetFilters = useCallback(() => {
    setTierFilter(partyTier);
    setCategoryFilter('');
    setSearchTerm('');
    onFilterChange({ tier: partyTier, category: undefined, searchTerm: undefined });
  }, [partyTier, onFilterChange]);

  // Selection helpers
  const handleToggleSelect = useCallback(
    (itemId: string, category: ItemCategory) => {
      const itemKey = `${category}:${itemId}`;
      const selected = selectedItems.find(
        (si) => `${si.item.category}:${si.item.data.name}` === itemKey
      );
      if (selected) {
        onDeselect(itemId, category);
      } else {
        const item = items.find(
          (i) => i.data.name === itemId && i.category === category
        );
        if (item) {
          onSelect(item);
        }
      }
    },
    [items, selectedItems, onSelect, onDeselect]
  );

  const isSelected = useCallback(
    (itemId: string, category: ItemCategory) =>
      selectedItems.some(
        (si) => si.item.data.name === itemId && si.item.category === category
      ),
    [selectedItems]
  );

  const getQuantity = useCallback(
    (itemId: string, category: ItemCategory) => {
      const selected = selectedItems.find(
        (si) => si.item.data.name === itemId && si.item.category === category
      );
      return selected?.quantity ?? 1;
    },
    [selectedItems]
  );

  // Counts
  const selectedCount = selectedItems.length;
  const confirmedCount = confirmedItemIds.size;
  const allConfirmed = selectedCount > 0 && confirmedCount === selectedCount;
  const totalQuantity = selectedItems.reduce((sum, si) => sum + si.quantity, 0);

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <ItemSelectorHeader
          selectedCount={0}
          confirmedCount={0}
          totalQuantity={0}
        />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-blood-600 dark:text-blood-400 font-medium mb-4">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 text-sm bg-gold-500 hover:bg-gold-400 text-ink-900 rounded-fantasy transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <ItemSelectorHeader
          selectedCount={selectedCount}
          confirmedCount={confirmedCount}
          totalQuantity={totalQuantity}
          isLoading
        />
        <div className="flex-1 flex items-center justify-center p-8">
          <div role="status" className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
            <span className="text-ink-600 dark:text-parchment-400">Loading items...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <ItemSelectorHeader
        selectedCount={selectedCount}
        confirmedCount={confirmedCount}
        totalQuantity={totalQuantity}
      />

      {/* Filter Bar */}
      <div className="p-4 border-b border-ink-200 dark:border-shadow-600 bg-parchment-50/50 dark:bg-shadow-800/50">
        <div className="flex flex-wrap gap-3">
          {/* Tier filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="tier-filter"
              className="text-xs font-medium text-ink-600 dark:text-parchment-400"
            >
              Tier:
            </label>
            <select
              id="tier-filter"
              value={tierFilter ?? ''}
              onChange={(e) => handleTierChange(e.target.value ? Number(e.target.value) : undefined)}
              className="
                px-2 py-1 text-sm
                bg-white dark:bg-shadow-700
                border border-ink-300 dark:border-shadow-500
                rounded text-ink-700 dark:text-parchment-300
                focus:ring-1 focus:ring-gold-400 focus:border-gold-400
              "
            >
              <option value="">All</option>
              <option value="1">T1</option>
              <option value="2">T2</option>
              <option value="3">T3</option>
              <option value="4">T4</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="category-filter"
              className="text-xs font-medium text-ink-600 dark:text-parchment-400"
            >
              Category:
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value as ItemCategory | '')}
              className="
                px-2 py-1 text-sm
                bg-white dark:bg-shadow-700
                border border-ink-300 dark:border-shadow-500
                rounded text-ink-700 dark:text-parchment-300
                focus:ring-1 focus:ring-gold-400 focus:border-gold-400
              "
            >
              <option value="">All</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[150px]">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search items..."
              aria-label="Search items"
              className="
                w-full px-3 py-1 text-sm
                bg-white dark:bg-shadow-700
                border border-ink-300 dark:border-shadow-500
                rounded text-ink-700 dark:text-parchment-300
                placeholder:text-ink-400 dark:placeholder:text-parchment-600
                focus:ring-1 focus:ring-gold-400 focus:border-gold-400
              "
            />
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="
              px-3 py-1 text-xs font-medium
              text-ink-600 dark:text-parchment-400
              hover:text-gold-600 dark:hover:text-gold-400
              transition-colors
            "
          >
            Reset
          </button>
        </div>
      </div>

      {/* Item Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-ink-500 dark:text-parchment-500 mb-2">
                No items found matching your filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-sm text-gold-600 dark:text-gold-400 hover:text-gold-500 dark:hover:text-gold-300"
              >
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {filteredItems.map((item) => {
              const itemKey = `${item.category}:${item.data.name}`;
              return (
                <li key={itemKey} role="listitem">
                  <ItemCard
                    item={item}
                    isSelected={isSelected(item.data.name, item.category)}
                    quantity={getQuantity(item.data.name, item.category)}
                    isConfirmed={confirmedItemIds.has(itemKey)}
                    onToggleSelect={handleToggleSelect}
                    onQuantityChange={onQuantityChange}
                    onConfirm={onConfirm}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer with actions */}
      <div className="p-4 border-t border-ink-200 dark:border-shadow-600 bg-parchment-100 dark:bg-shadow-800">
        {selectedCount === 0 ? (
          <p className="text-center text-sm text-ink-500 dark:text-parchment-500">
            Select items to add to your adventure
          </p>
        ) : allConfirmed ? (
          <button
            type="button"
            onClick={onProceed}
            className="
              w-full py-3 px-4 rounded-fantasy border-2
              bg-gold-500 border-gold-600 text-ink-900
              font-serif font-semibold text-base
              hover:bg-gold-400 hover:border-gold-500
              dark:bg-gold-600 dark:border-gold-500 dark:text-ink-900
              dark:hover:bg-gold-500 dark:hover:border-gold-400
              shadow-gold-glow
              transition-all duration-200
            "
          >
            Proceed to Echoes
          </button>
        ) : (
          <button
            type="button"
            onClick={onConfirmAll}
            disabled={isLoading || selectedCount === 0}
            className="
              w-full py-3 px-4 rounded-fantasy border-2
              bg-parchment-200 dark:bg-shadow-600
              border-ink-300 dark:border-shadow-500
              text-ink-700 dark:text-parchment-300
              font-serif font-semibold text-base
              hover:bg-gold-100 hover:border-gold-400
              dark:hover:bg-gold-900/30 dark:hover:border-gold-600
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            Confirm All Selections ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

interface ItemSelectorHeaderProps {
  selectedCount: number;
  confirmedCount: number;
  totalQuantity: number;
  isLoading?: boolean;
}

function ItemSelectorHeader({
  selectedCount,
  confirmedCount,
  totalQuantity,
  isLoading,
}: ItemSelectorHeaderProps) {
  return (
    <div className="p-4 border-b border-ink-200 dark:border-shadow-600">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-ink-800 dark:text-parchment-100">
            Select Items
          </h2>
          <p className="text-sm text-ink-500 dark:text-parchment-500">
            Choose rewards and equipment for your adventure
          </p>
        </div>
        {!isLoading && selectedCount > 0 && (
          <div className="text-right">
            <div className="text-lg font-semibold text-gold-600 dark:text-gold-400">
              {confirmedCount}/{selectedCount}
            </div>
            <div className="text-xs text-ink-500 dark:text-parchment-500">
              confirmed ({totalQuantity} total)
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!isLoading && selectedCount > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-parchment-200 dark:bg-shadow-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500 dark:bg-gold-600 transition-all duration-300"
              style={{ width: `${(confirmedCount / selectedCount) * 100}%` }}
              role="progressbar"
              aria-valuenow={confirmedCount}
              aria-valuemin={0}
              aria-valuemax={selectedCount}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function getCategoryLabel(category: ItemCategory): string {
  switch (category) {
    case 'item':
      return 'Items';
    case 'weapon':
      return 'Weapons';
    case 'armor':
      return 'Armor';
    case 'consumable':
      return 'Consumables';
  }
}
