/**
 * Adventure Store - Session and phase management
 *
 * Manages the overall adventure session state including:
 * - Session identification
 * - Current phase tracking
 * - Phase history for navigation
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Phase } from '@dagger-app/shared-types';
import { useChatStore } from './chatStore';

// =============================================================================
// Types
// =============================================================================

export interface AdventureState {
  // Session data
  sessionId: string | null;
  adventureName: string;
  createdAt: Date | null;

  // Claude session for content generation continuity
  claudeSessionId: string | null;

  // Phase management
  currentPhase: Phase;
  phaseHistory: Phase[];

  // Actions
  initSession: (name?: string) => void;
  setAdventureName: (name: string) => void;
  setClaudeSessionId: (sessionId: string | null) => void;
  setPhase: (phase: Phase) => void;
  goToPreviousPhase: () => void;
  reset: () => void;
}

// =============================================================================
// Initial State
// =============================================================================

const initialState = {
  sessionId: null,
  adventureName: '',
  createdAt: null,
  claudeSessionId: null,
  currentPhase: 'setup' as Phase,
  phaseHistory: [] as Phase[],
};

// =============================================================================
// Store
// =============================================================================

export const useAdventureStore = create<AdventureState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        /**
         * Initialize a new adventure session
         * @param name - Optional adventure name (defaults to empty string)
         */
        initSession: (name: string = '') => {
          const sessionId = crypto.randomUUID();
          // Clear chat messages from previous sessions
          useChatStore.getState().clearMessages();

          // Add welcome message to guide the user
          const welcomeMessage = `🎲 Welcome to Dagger-Gen!

I'll help you create an exciting Daggerheart adventure. Let's start by configuring your adventure settings.

✨ **To begin, tell me about your party:**
- How many players will be adventuring?
- What tier are they (1-4)?
- How long is your session?

You can also adjust settings in the **Adventure Dials** panel on the right. Once all dials are confirmed, we'll move on to selecting your adventure frame! 🗺️`;

          useChatStore.getState().addMessage({
            role: 'assistant',
            content: welcomeMessage,
          });

          set(
            {
              sessionId,
              adventureName: name,
              createdAt: new Date(),
              currentPhase: 'dial-tuning',
              phaseHistory: ['setup'],
            },
            false,
            'initSession'
          );
        },

        /**
         * Set or update the adventure name
         * @param name - The adventure name (will be trimmed)
         */
        setAdventureName: (name: string) => {
          set(
            {
              adventureName: name.trim(),
            },
            false,
            'setAdventureName'
          );
        },

        /**
         * Set the Claude session ID for content generation continuity
         * @param sessionId - The Claude session ID from backend, or null to clear
         */
        setClaudeSessionId: (sessionId: string | null) => {
          set(
            {
              claudeSessionId: sessionId,
            },
            false,
            'setClaudeSessionId'
          );
        },

        /**
         * Move to a new phase, adding current phase to history
         */
        setPhase: (phase: Phase) => {
          const { currentPhase, phaseHistory } = get();
          if (phase === currentPhase) return;

          set(
            {
              currentPhase: phase,
              phaseHistory: [...phaseHistory, currentPhase],
            },
            false,
            'setPhase'
          );
        },

        /**
         * Go back to the previous phase
         */
        goToPreviousPhase: () => {
          const { phaseHistory } = get();
          if (phaseHistory.length === 0) return;

          const newHistory = [...phaseHistory];
          const previousPhase = newHistory.pop()!;

          set(
            {
              currentPhase: previousPhase,
              phaseHistory: newHistory,
            },
            false,
            'goToPreviousPhase'
          );
        },

        /**
         * Reset the adventure state to initial values
         */
        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'dagger-adventure-storage',
        // Handle Date serialization
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            // Restore Date object
            if (parsed.state?.createdAt) {
              parsed.state.createdAt = new Date(parsed.state.createdAt);
            }
            return parsed;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            localStorage.removeItem(name);
          },
        },
      }
    ),
    { name: 'AdventureStore' }
  )
);

// =============================================================================
// Selectors
// =============================================================================

/**
 * Check if a session is active
 */
export const selectHasActiveSession = (state: AdventureState): boolean =>
  state.sessionId !== null;

/**
 * Check if user can go back to previous phase
 */
export const selectCanGoBack = (state: AdventureState): boolean =>
  state.phaseHistory.length > 0;

/**
 * Get the phase order index (0-9)
 */
export const selectPhaseIndex = (state: AdventureState): number => {
  const phaseOrder: Phase[] = [
    'setup',
    'dial-tuning',
    'frame',
    'outline',
    'scenes',
    'npcs',
    'adversaries',
    'items',
    'echoes',
    'complete',
  ];
  return phaseOrder.indexOf(state.currentPhase);
};

/**
 * Check if adventure is complete
 */
export const selectIsComplete = (state: AdventureState): boolean =>
  state.currentPhase === 'complete';
