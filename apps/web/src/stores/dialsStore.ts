/**
 * Dials Store - All 14 dial values with validation
 *
 * Manages the adventure dial state including:
 * - 4 concrete dials (partySize, partyTier, sceneCount, sessionLength)
 * - 6 conceptual dials (tone, pillarBalance, npcDensity, lethality, emotionalRegister, themes)
 * - Dial confirmation tracking
 * - Validation logic
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  DialId,
  DialValue,
  ThemeOption,
  ConcreteDials,
  ConceptualDials,
  PillarBalance,
} from '@dagger-app/shared-types';
import {
  DEFAULT_CONCRETE_DIALS,
  DEFAULT_CONCEPTUAL_DIALS,
  isValidPartySize,
  isValidPartyTier,
  isValidSceneCount,
  isValidSessionLength,
  isValidThemes,
  isValidTone,
  isValidNPCDensity,
  isValidLethality,
  isValidEmotionalRegister,
  isValidPillarBalance,
  DIAL_CONSTRAINTS,
} from '@dagger-app/shared-types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Concrete dial IDs that should be pre-confirmed on initialization.
 * These dials have meaningful defaults (4 players, tier 1, 4 scenes, 3-4 hours).
 */
export const DEFAULT_CONFIRMED_DIALS: DialId[] = [
  'partySize',
  'partyTier',
  'sceneCount',
  'sessionLength',
];

// =============================================================================
// Types
// =============================================================================

export interface DialsState extends ConcreteDials, ConceptualDials {
  /** Set of dial IDs that have been confirmed by the user */
  confirmedDials: Set<DialId>;

  // Actions
  setDial: <K extends DialId>(dialId: K, value: DialsState[K]) => boolean;
  confirmDial: (dialId: DialId) => void;
  unconfirmDial: (dialId: DialId) => void;
  resetDials: () => void;
  resetDial: (dialId: DialId) => void;

  // Theme-specific actions
  addTheme: (theme: ThemeOption) => boolean;
  removeTheme: (theme: ThemeOption) => void;
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Validate a dial value based on its ID
 */
function validateDialValue(dialId: DialId, value: DialValue): boolean {
  switch (dialId) {
    case 'partySize':
      return typeof value === 'number' && isValidPartySize(value);
    case 'partyTier':
      return typeof value === 'number' && isValidPartyTier(value);
    case 'sceneCount':
      return typeof value === 'number' && isValidSceneCount(value);
    case 'sessionLength':
      return typeof value === 'string' && isValidSessionLength(value);
    case 'themes':
      return Array.isArray(value) && isValidThemes(value as ThemeOption[]);
    // Discrete conceptual dials with specific option types
    case 'tone':
      return value === null || (typeof value === 'string' && isValidTone(value));
    case 'npcDensity':
      return value === null || (typeof value === 'string' && isValidNPCDensity(value));
    case 'lethality':
      return value === null || (typeof value === 'string' && isValidLethality(value));
    case 'emotionalRegister':
      return value === null || (typeof value === 'string' && isValidEmotionalRegister(value));
    // PillarBalance is a complex object
    case 'pillarBalance':
      return value === null || isValidPillarBalance(value as PillarBalance);
    default:
      return false;
  }
}

// =============================================================================
// Migration Logic
// =============================================================================

/**
 * Migrate old localStorage data to new discrete type format
 * Handles graceful migration of:
 * - partySize: 6 -> 5 (or 4 if out of range)
 * - Old string-based conceptual dials -> new discrete types
 * - combatExplorationBalance -> pillarBalance object
 */
function migrateDialsData(state: Record<string, unknown>): Record<string, unknown> {
  const migrated = { ...state };

  // Migrate partySize: old range was 2-6, new range is 2-5
  if (typeof migrated.partySize === 'number') {
    if (migrated.partySize === 6) {
      migrated.partySize = 5;
    } else if (migrated.partySize < 2 || migrated.partySize > 5) {
      migrated.partySize = DEFAULT_CONCRETE_DIALS.partySize;
    }
  }

  // Migrate old combatExplorationBalance string to pillarBalance object
  if ('combatExplorationBalance' in migrated && !migrated.pillarBalance) {
    migrated.pillarBalance = DEFAULT_CONCEPTUAL_DIALS.pillarBalance;
    delete migrated.combatExplorationBalance;
  }

  // Migrate old tone string values to new discrete options
  if (typeof migrated.tone === 'string' && migrated.tone !== null) {
    migrated.tone = migrateToneValue(migrated.tone);
  }

  // Migrate old npcDensity string values to new discrete options
  if (typeof migrated.npcDensity === 'string' && migrated.npcDensity !== null) {
    migrated.npcDensity = migrateNPCDensityValue(migrated.npcDensity);
  }

  // Migrate old lethality string values to new discrete options
  if (typeof migrated.lethality === 'string' && migrated.lethality !== null) {
    migrated.lethality = migrateLethalityValue(migrated.lethality);
  }

  // Migrate old emotionalRegister string values to new discrete options
  if (typeof migrated.emotionalRegister === 'string' && migrated.emotionalRegister !== null) {
    migrated.emotionalRegister = migrateEmotionalRegisterValue(migrated.emotionalRegister);
  }

  return migrated;
}

/**
 * Map old tone string to nearest discrete option
 */
function migrateToneValue(oldValue: string): string | null {
  const normalized = oldValue.toLowerCase();

  // Check if it's already a valid new option
  if (['grim', 'serious', 'balanced', 'lighthearted', 'whimsical'].includes(normalized)) {
    return normalized;
  }

  // Map legacy spectrum-style values to discrete options
  if (normalized.includes('grim') || normalized.includes('dark')) {
    return 'grim';
  }
  if (normalized.includes('serious') || normalized.includes('dramatic')) {
    return 'serious';
  }
  if (normalized.includes('light') || normalized.includes('fun')) {
    return 'lighthearted';
  }
  if (normalized.includes('whimsical') || normalized.includes('playful') || normalized.includes('comedic')) {
    return 'whimsical';
  }
  if (normalized.includes('balanced') || normalized.includes('middle')) {
    return 'balanced';
  }

  // Default to null if we can't map it
  return null;
}

/**
 * Map old NPC density string to nearest discrete option
 */
function migrateNPCDensityValue(oldValue: string): string | null {
  const normalized = oldValue.toLowerCase();

  // Check if it's already a valid new option
  if (['sparse', 'moderate', 'rich'].includes(normalized)) {
    return normalized;
  }

  // Map legacy spectrum-style values
  if (normalized.includes('sparse') || normalized.includes('few') || normalized.includes('low')) {
    return 'sparse';
  }
  if (normalized.includes('rich') || normalized.includes('many') || normalized.includes('high')) {
    return 'rich';
  }
  if (normalized.includes('moderate') || normalized.includes('balanced') || normalized.includes('middle')) {
    return 'moderate';
  }

  return null;
}

/**
 * Map old lethality string to nearest discrete option
 */
function migrateLethalityValue(oldValue: string): string | null {
  const normalized = oldValue.toLowerCase();

  // Check if it's already a valid new option
  if (['heroic', 'standard', 'dangerous', 'brutal'].includes(normalized)) {
    return normalized;
  }

  // Map legacy spectrum-style values
  if (normalized.includes('heroic') || normalized.includes('safe') || normalized.includes('forgiving')) {
    return 'heroic';
  }
  if (normalized.includes('brutal') || normalized.includes('deadly') || normalized.includes('lethal')) {
    return 'brutal';
  }
  if (normalized.includes('dangerous') || normalized.includes('tactical')) {
    return 'dangerous';
  }
  if (normalized.includes('standard') || normalized.includes('balanced') || normalized.includes('middle')) {
    return 'standard';
  }

  return null;
}

/**
 * Map old emotional register string to nearest discrete option
 */
function migrateEmotionalRegisterValue(oldValue: string): string | null {
  const normalized = oldValue.toLowerCase();

  // Check if it's already a valid new option
  if (['thrilling', 'tense', 'heartfelt', 'bittersweet', 'epic'].includes(normalized)) {
    return normalized;
  }

  // Map legacy spectrum-style values
  if (normalized.includes('thrill') || normalized.includes('exciting') || normalized.includes('action')) {
    return 'thrilling';
  }
  if (normalized.includes('tense') || normalized.includes('suspense')) {
    return 'tense';
  }
  if (normalized.includes('heartfelt') || normalized.includes('emotional') || normalized.includes('touching')) {
    return 'heartfelt';
  }
  if (normalized.includes('bittersweet') || normalized.includes('melancholy')) {
    return 'bittersweet';
  }
  if (normalized.includes('epic') || normalized.includes('grand') || normalized.includes('heroic')) {
    return 'epic';
  }

  return null;
}

// =============================================================================
// Initial State
// =============================================================================

const initialDialValues = {
  ...DEFAULT_CONCRETE_DIALS,
  ...DEFAULT_CONCEPTUAL_DIALS,
  confirmedDials: new Set<DialId>(DEFAULT_CONFIRMED_DIALS),
};

// =============================================================================
// Store
// =============================================================================

export const useDialsStore = create<DialsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialDialValues,

        /**
         * Set a dial value with validation
         * Returns true if the value was valid and set, false otherwise
         */
        setDial: <K extends DialId>(dialId: K, value: DialsState[K]): boolean => {
          if (!validateDialValue(dialId, value as DialValue)) {
            console.warn(`Invalid value for dial ${dialId}:`, value);
            return false;
          }

          set({ [dialId]: value } as Partial<DialsState>, false, `setDial:${dialId}`);
          return true;
        },

        /**
         * Mark a dial as confirmed by the user
         */
        confirmDial: (dialId: DialId) => {
          const { confirmedDials } = get();
          const newConfirmed = new Set(confirmedDials);
          newConfirmed.add(dialId);
          set({ confirmedDials: newConfirmed }, false, `confirmDial:${dialId}`);
        },

        /**
         * Unmark a dial as confirmed
         */
        unconfirmDial: (dialId: DialId) => {
          const { confirmedDials } = get();
          const newConfirmed = new Set(confirmedDials);
          newConfirmed.delete(dialId);
          set({ confirmedDials: newConfirmed }, false, `unconfirmDial:${dialId}`);
        },

        /**
         * Reset all dials to defaults
         */
        resetDials: () => {
          set(
            {
              ...DEFAULT_CONCRETE_DIALS,
              ...DEFAULT_CONCEPTUAL_DIALS,
              confirmedDials: new Set<DialId>(DEFAULT_CONFIRMED_DIALS),
            },
            false,
            'resetDials'
          );
        },

        /**
         * Reset a specific dial to its default
         */
        resetDial: (dialId: DialId) => {
          const defaultValue =
            dialId in DEFAULT_CONCRETE_DIALS
              ? DEFAULT_CONCRETE_DIALS[dialId as keyof ConcreteDials]
              : DEFAULT_CONCEPTUAL_DIALS[dialId as keyof ConceptualDials];

          const { confirmedDials } = get();
          const newConfirmed = new Set(confirmedDials);
          newConfirmed.delete(dialId);

          set(
            {
              [dialId]: defaultValue,
              confirmedDials: newConfirmed,
            } as Partial<DialsState>,
            false,
            `resetDial:${dialId}`
          );
        },

        /**
         * Add a theme (max 3)
         * Returns true if theme was added, false if max reached or already exists
         */
        addTheme: (theme: ThemeOption): boolean => {
          const { themes } = get();
          if (themes.includes(theme)) return false;
          if (themes.length >= DIAL_CONSTRAINTS.themes.maxSelections) return false;

          set({ themes: [...themes, theme] }, false, 'addTheme');
          return true;
        },

        /**
         * Remove a theme
         */
        removeTheme: (theme: ThemeOption) => {
          const { themes } = get();
          set({ themes: themes.filter((t) => t !== theme) }, false, 'removeTheme');
        },
      }),
      {
        name: 'dagger-dials-storage',
        // Handle Set serialization and data migration
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);

            // Migrate legacy data to new format
            if (parsed.state) {
              parsed.state = migrateDialsData(parsed.state);
            }

            // Restore Set from array
            if (parsed.state?.confirmedDials) {
              parsed.state.confirmedDials = new Set(parsed.state.confirmedDials);
            }
            return parsed;
          },
          setItem: (name, value) => {
            // Convert Set to array for serialization
            const serializable = {
              ...value,
              state: {
                ...value.state,
                confirmedDials: value.state?.confirmedDials
                  ? Array.from(value.state.confirmedDials)
                  : [],
              },
            };
            localStorage.setItem(name, JSON.stringify(serializable));
          },
          removeItem: (name) => {
            localStorage.removeItem(name);
          },
        },
      }
    ),
    { name: 'DialsStore' }
  )
);

// =============================================================================
// Selectors
// =============================================================================

/**
 * Get all unconfirmed dial IDs
 */
export const selectUnconfirmedDials = (state: DialsState): DialId[] => {
  const allDialIds: DialId[] = [
    'partySize',
    'partyTier',
    'sceneCount',
    'sessionLength',
    'tone',
    'pillarBalance',
    'npcDensity',
    'lethality',
    'emotionalRegister',
    'themes',
  ];
  return allDialIds.filter((id) => !state.confirmedDials.has(id));
};

/**
 * Get count of confirmed dials
 */
export const selectConfirmedCount = (state: DialsState): number => state.confirmedDials.size;

/**
 * Get completion percentage (0-100)
 */
export const selectCompletionPercentage = (state: DialsState): number => {
  const total = 10; // Total number of dials
  return Math.round((state.confirmedDials.size / total) * 100);
};

/**
 * Check if all required dials (concrete) are confirmed
 */
export const selectRequiredDialsComplete = (state: DialsState): boolean => {
  const requiredDials: DialId[] = ['partySize', 'partyTier', 'sceneCount', 'sessionLength'];
  return requiredDials.every((id) => state.confirmedDials.has(id));
};

/**
 * Check if a specific dial is confirmed
 */
export const selectIsDialConfirmed = (state: DialsState, dialId: DialId): boolean =>
  state.confirmedDials.has(dialId);

/**
 * Get concrete dial values only
 */
export const selectConcreteDials = (state: DialsState): ConcreteDials => ({
  partySize: state.partySize,
  partyTier: state.partyTier,
  sceneCount: state.sceneCount,
  sessionLength: state.sessionLength,
});

/**
 * Get conceptual dial values only
 */
export const selectConceptualDials = (state: DialsState): ConceptualDials => ({
  tone: state.tone,
  pillarBalance: state.pillarBalance,
  npcDensity: state.npcDensity,
  lethality: state.lethality,
  emotionalRegister: state.emotionalRegister,
  themes: state.themes,
});

/**
 * Check if themes are at max capacity
 */
export const selectThemesAtMax = (state: DialsState): boolean =>
  state.themes.length >= DIAL_CONSTRAINTS.themes.maxSelections;

/**
 * Get a summary object suitable for display
 */
export const selectDialsSummary = (
  state: DialsState
): { concrete: ConcreteDials; conceptual: ConceptualDials; confirmedCount: number } => ({
  concrete: selectConcreteDials(state),
  conceptual: selectConceptualDials(state),
  confirmedCount: state.confirmedDials.size,
});
