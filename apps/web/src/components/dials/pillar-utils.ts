/**
 * Pillar Balance Utility Functions
 *
 * Shared utilities for pillar balance manipulation
 */

import { arrayMove } from '@dnd-kit/sortable';
import type { Pillar, PillarBalance } from '@dagger-app/shared-types';

/** Reorder pillars array by moving item from one index to another */
export function reorderPillars(
  pillars: Pillar[],
  fromIndex: number,
  toIndex: number
): Pillar[] {
  return arrayMove(pillars, fromIndex, toIndex);
}

/** Convert ordered pillar array to PillarBalance object */
export function arrayToBalance(pillars: Pillar[]): PillarBalance {
  return {
    primary: pillars[0],
    secondary: pillars[1],
    tertiary: pillars[2],
  };
}

/** Convert PillarBalance to ordered array */
export function balanceToArray(balance: PillarBalance): Pillar[] {
  return [balance.primary, balance.secondary, balance.tertiary];
}
