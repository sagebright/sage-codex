/**
 * Adversary Actions Slice Creator
 *
 * Creates adversary-related actions for the content store.
 * Handles adversary selection, filtering, quantity updates, and confirmation.
 */

import type {
  DaggerheartAdversary,
  SelectedAdversary,
  AdversaryFilterOptions,
} from '@dagger-app/shared-types';
import type { SetState, GetState } from './types';
import { addToSet, removeFromSet } from '../utils/storeUtils';

export interface AdversaryActions {
  setAvailableAdversaries: (adversaries: DaggerheartAdversary[], types?: string[]) => void;
  selectAdversary: (adversary: DaggerheartAdversary, quantity?: number) => void;
  deselectAdversary: (adversaryId: string) => void;
  updateAdversaryQuantity: (adversaryId: string, quantity: number) => void;
  confirmAdversary: (adversaryId: string) => void;
  confirmAllAdversaries: () => void;
  setAdversaryFilters: (filters: Partial<AdversaryFilterOptions>) => void;
  setAdversaryLoading: (loading: boolean) => void;
  setAdversaryError: (error: string | null) => void;
  clearAdversaries: () => void;
}

/**
 * Creates adversary-related actions for the content store.
 */
export function createAdversaryActions(set: SetState, get: GetState): AdversaryActions {
  return {
    setAvailableAdversaries: (adversaries: DaggerheartAdversary[], types?: string[]) => {
      set(
        {
          availableAdversaries: adversaries,
          availableAdversaryTypes: types ?? [],
          adversaryError: null,
        },
        false,
        'setAvailableAdversaries'
      );
    },

    selectAdversary: (adversary: DaggerheartAdversary, quantity = 1) => {
      const { selectedAdversaries } = get();
      const existing = selectedAdversaries.find((sa) => sa.adversary.name === adversary.name);

      if (existing) {
        const updated = selectedAdversaries.map((sa) =>
          sa.adversary.name === adversary.name
            ? { ...sa, quantity: sa.quantity + quantity }
            : sa
        );
        set({ selectedAdversaries: updated }, false, 'selectAdversary');
      } else {
        const newSelection: SelectedAdversary = { adversary, quantity };
        set(
          { selectedAdversaries: [...selectedAdversaries, newSelection] },
          false,
          'selectAdversary'
        );
      }
    },

    deselectAdversary: (adversaryId: string) => {
      const { selectedAdversaries, confirmedAdversaryIds } = get();
      const filtered = selectedAdversaries.filter((sa) => sa.adversary.name !== adversaryId);
      set(
        {
          selectedAdversaries: filtered,
          confirmedAdversaryIds: removeFromSet(confirmedAdversaryIds, adversaryId),
        },
        false,
        'deselectAdversary'
      );
    },

    updateAdversaryQuantity: (adversaryId: string, quantity: number) => {
      const { selectedAdversaries } = get();
      const clampedQty = Math.max(1, Math.min(10, quantity));
      const updated = selectedAdversaries.map((sa) =>
        sa.adversary.name === adversaryId ? { ...sa, quantity: clampedQty } : sa
      );
      set({ selectedAdversaries: updated }, false, 'updateAdversaryQuantity');
    },

    confirmAdversary: (adversaryId: string) => {
      const { confirmedAdversaryIds } = get();
      set(
        { confirmedAdversaryIds: addToSet(confirmedAdversaryIds, adversaryId) },
        false,
        'confirmAdversary'
      );
    },

    confirmAllAdversaries: () => {
      const { selectedAdversaries } = get();
      const allIds = new Set(selectedAdversaries.map((sa) => sa.adversary.name));
      set({ confirmedAdversaryIds: allIds }, false, 'confirmAllAdversaries');
    },

    setAdversaryFilters: (filters: Partial<AdversaryFilterOptions>) => {
      const { adversaryFilters } = get();
      set(
        { adversaryFilters: { ...adversaryFilters, ...filters } },
        false,
        'setAdversaryFilters'
      );
    },

    setAdversaryLoading: (loading: boolean) => {
      set({ adversaryLoading: loading }, false, 'setAdversaryLoading');
    },

    setAdversaryError: (error: string | null) => {
      set({ adversaryError: error, adversaryLoading: false }, false, 'setAdversaryError');
    },

    clearAdversaries: () => {
      set(
        {
          availableAdversaries: [],
          selectedAdversaries: [],
          confirmedAdversaryIds: new Set<string>(),
          adversaryLoading: false,
          adversaryError: null,
          availableAdversaryTypes: [],
          adversaryFilters: {},
        },
        false,
        'clearAdversaries'
      );
    },
  };
}
