/**
 * Item Actions Slice Creator
 *
 * Creates item-related actions for the content store.
 * Handles item selection, filtering, quantity updates, and confirmation.
 */

import type {
  UnifiedItem,
  SelectedItem,
  ItemFilterOptions,
  ItemCategory,
} from '@dagger-app/shared-types';
import type { SetState, GetState } from './types';
import { addToSet, removeFromSet } from '../utils/storeUtils';

export interface ItemActions {
  setAvailableItems: (items: UnifiedItem[], categories?: ItemCategory[]) => void;
  selectItem: (item: UnifiedItem, quantity?: number) => void;
  deselectItem: (itemId: string, category: ItemCategory) => void;
  updateItemQuantity: (itemId: string, category: ItemCategory, quantity: number) => void;
  confirmItem: (itemId: string, category: ItemCategory) => void;
  confirmAllItems: () => void;
  setItemFilters: (filters: Partial<ItemFilterOptions>) => void;
  setItemLoading: (loading: boolean) => void;
  setItemError: (error: string | null) => void;
  clearItems: () => void;
}

/** Creates item key from category and name */
function createItemKey(category: ItemCategory, name: string): string {
  return `${category}:${name}`;
}

/**
 * Creates item-related actions for the content store.
 */
export function createItemActions(set: SetState, get: GetState): ItemActions {
  return {
    setAvailableItems: (items: UnifiedItem[], categories?: ItemCategory[]) => {
      set(
        {
          availableItems: items,
          availableItemCategories: categories ?? [],
          itemError: null,
        },
        false,
        'setAvailableItems'
      );
    },

    selectItem: (item: UnifiedItem, quantity = 1) => {
      const { selectedItems } = get();
      const itemKey = createItemKey(item.category, item.data.name);
      const existing = selectedItems.find(
        (si) => createItemKey(si.item.category, si.item.data.name) === itemKey
      );

      if (existing) {
        const updated = selectedItems.map((si) =>
          createItemKey(si.item.category, si.item.data.name) === itemKey
            ? { ...si, quantity: si.quantity + quantity }
            : si
        );
        set({ selectedItems: updated }, false, 'selectItem');
      } else {
        const newSelection: SelectedItem = { item, quantity };
        set(
          { selectedItems: [...selectedItems, newSelection] },
          false,
          'selectItem'
        );
      }
    },

    deselectItem: (itemId: string, category: ItemCategory) => {
      const { selectedItems, confirmedItemIds } = get();
      const itemKey = createItemKey(category, itemId);
      const filtered = selectedItems.filter(
        (si) => createItemKey(si.item.category, si.item.data.name) !== itemKey
      );
      set(
        {
          selectedItems: filtered,
          confirmedItemIds: removeFromSet(confirmedItemIds, itemKey),
        },
        false,
        'deselectItem'
      );
    },

    updateItemQuantity: (itemId: string, category: ItemCategory, quantity: number) => {
      const { selectedItems } = get();
      const itemKey = createItemKey(category, itemId);
      const clampedQty = Math.max(1, Math.min(10, quantity));
      const updated = selectedItems.map((si) =>
        createItemKey(si.item.category, si.item.data.name) === itemKey
          ? { ...si, quantity: clampedQty }
          : si
      );
      set({ selectedItems: updated }, false, 'updateItemQuantity');
    },

    confirmItem: (itemId: string, category: ItemCategory) => {
      const { confirmedItemIds } = get();
      const itemKey = createItemKey(category, itemId);
      set(
        { confirmedItemIds: addToSet(confirmedItemIds, itemKey) },
        false,
        'confirmItem'
      );
    },

    confirmAllItems: () => {
      const { selectedItems } = get();
      const allIds = new Set(
        selectedItems.map((si) => createItemKey(si.item.category, si.item.data.name))
      );
      set({ confirmedItemIds: allIds }, false, 'confirmAllItems');
    },

    setItemFilters: (filters: Partial<ItemFilterOptions>) => {
      const { itemFilters } = get();
      set(
        { itemFilters: { ...itemFilters, ...filters } },
        false,
        'setItemFilters'
      );
    },

    setItemLoading: (loading: boolean) => {
      set({ itemLoading: loading }, false, 'setItemLoading');
    },

    setItemError: (error: string | null) => {
      set({ itemError: error, itemLoading: false }, false, 'setItemError');
    },

    clearItems: () => {
      set(
        {
          availableItems: [],
          selectedItems: [],
          confirmedItemIds: new Set<string>(),
          itemLoading: false,
          itemError: null,
          availableItemCategories: [],
          itemFilters: {},
        },
        false,
        'clearItems'
      );
    },
  };
}
