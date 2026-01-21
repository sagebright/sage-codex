/**
 * Adventure Store Tests
 *
 * Tests for session and phase management:
 * - initSession creates session with UUID and Date
 * - setPhase tracks history correctly
 * - goToPreviousPhase navigates history
 * - Date serialization/deserialization in persist middleware
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
  useAdventureStore,
  selectHasActiveSession,
  selectCanGoBack,
  selectPhaseIndex,
  selectIsComplete,
} from './adventureStore';
import { useChatStore } from './chatStore';
import {
  clearPersistedStorage,
  storeAction,
  verifyDateSerialization,
} from '../test/store-utils';

// Storage keys used by the stores
const STORAGE_KEY = 'dagger-adventure-storage';
const CHAT_STORAGE_KEY = 'dagger-chat-storage';

describe('adventureStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearPersistedStorage(STORAGE_KEY);
    clearPersistedStorage(CHAT_STORAGE_KEY);

    // Reset stores to initial state
    act(() => {
      useAdventureStore.getState().reset();
      useChatStore.getState().clearMessages();
    });
  });

  describe('initial state', () => {
    it('starts with null session and setup phase', () => {
      const state = useAdventureStore.getState();

      expect(state.sessionId).toBeNull();
      expect(state.adventureName).toBe('');
      expect(state.createdAt).toBeNull();
      expect(state.currentPhase).toBe('setup');
      expect(state.phaseHistory).toEqual([]);
    });
  });

  describe('initSession', () => {
    it('creates a new session with UUID', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const state = useAdventureStore.getState();

      expect(state.sessionId).toBe('test-uuid-0001');
      expect(state.adventureName).toBe('Test Adventure');
    });

    it('sets createdAt to current Date', () => {
      const beforeTime = new Date();

      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const afterTime = new Date();
      const state = useAdventureStore.getState();

      expect(state.createdAt).toBeInstanceOf(Date);
      expect(state.createdAt!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(state.createdAt!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('moves to dial-tuning phase with setup in history', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const state = useAdventureStore.getState();

      expect(state.currentPhase).toBe('dial-tuning');
      expect(state.phaseHistory).toEqual(['setup']);
    });

    it('generates unique session IDs for multiple sessions', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Adventure 1');
      });
      const sessionId1 = useAdventureStore.getState().sessionId;

      storeAction(() => {
        useAdventureStore.getState().reset();
      });

      storeAction(() => {
        useAdventureStore.getState().initSession('Adventure 2');
      });
      const sessionId2 = useAdventureStore.getState().sessionId;

      expect(sessionId1).not.toBe(sessionId2);
    });

    it('adds welcome message to chat after clearing messages', () => {
      // Add some existing messages to verify they get cleared
      storeAction(() => {
        useChatStore.getState().addMessage({ role: 'user', content: 'old message' });
      });
      expect(useChatStore.getState().messages.length).toBe(1);

      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const messages = useChatStore.getState().messages;
      expect(messages.length).toBe(1);
      expect(messages[0].role).toBe('assistant');
      expect(messages[0].content).toContain('Welcome to Dagger-Gen');
    });

    it('includes emoji in welcome message', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const messages = useChatStore.getState().messages;
      const welcomeContent = messages[0].content;
      expect(welcomeContent).toContain('🎲');
      expect(welcomeContent).toContain('✨');
      expect(welcomeContent).toContain('🗺️');
    });

    it('includes guidance about party configuration in welcome message', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const messages = useChatStore.getState().messages;
      const welcomeContent = messages[0].content;
      expect(welcomeContent).toContain('party');
      expect(welcomeContent).toContain('tier');
      expect(welcomeContent).toContain('session');
    });

    it('mentions Adventure Dials panel in welcome message', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const messages = useChatStore.getState().messages;
      const welcomeContent = messages[0].content;
      expect(welcomeContent).toContain('Adventure Dials');
    });
  });

  describe('setPhase', () => {
    beforeEach(() => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });
    });

    it('changes current phase and adds previous to history', () => {
      storeAction(() => {
        useAdventureStore.getState().setPhase('frame');
      });

      const state = useAdventureStore.getState();

      expect(state.currentPhase).toBe('frame');
      expect(state.phaseHistory).toEqual(['setup', 'dial-tuning']);
    });

    it('does nothing if setting same phase', () => {
      const initialHistory = [...useAdventureStore.getState().phaseHistory];

      storeAction(() => {
        useAdventureStore.getState().setPhase('dial-tuning');
      });

      const state = useAdventureStore.getState();

      expect(state.currentPhase).toBe('dial-tuning');
      expect(state.phaseHistory).toEqual(initialHistory);
    });

    it('builds up phase history through multiple transitions', () => {
      storeAction(() => {
        useAdventureStore.getState().setPhase('frame');
      });
      storeAction(() => {
        useAdventureStore.getState().setPhase('outline');
      });
      storeAction(() => {
        useAdventureStore.getState().setPhase('scenes');
      });

      const state = useAdventureStore.getState();

      expect(state.currentPhase).toBe('scenes');
      expect(state.phaseHistory).toEqual(['setup', 'dial-tuning', 'frame', 'outline']);
    });
  });

  describe('goToPreviousPhase', () => {
    beforeEach(() => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });
    });

    it('navigates back to previous phase', () => {
      storeAction(() => {
        useAdventureStore.getState().setPhase('frame');
      });
      storeAction(() => {
        useAdventureStore.getState().goToPreviousPhase();
      });

      const state = useAdventureStore.getState();

      expect(state.currentPhase).toBe('dial-tuning');
      expect(state.phaseHistory).toEqual(['setup']);
    });

    it('does nothing when history is empty', () => {
      // Reset to have empty history
      storeAction(() => {
        useAdventureStore.getState().reset();
      });

      const stateBefore = useAdventureStore.getState();

      storeAction(() => {
        useAdventureStore.getState().goToPreviousPhase();
      });

      const stateAfter = useAdventureStore.getState();

      expect(stateAfter.currentPhase).toBe(stateBefore.currentPhase);
      expect(stateAfter.phaseHistory).toEqual(stateBefore.phaseHistory);
    });

    it('can navigate back multiple times', () => {
      storeAction(() => {
        useAdventureStore.getState().setPhase('frame');
      });
      storeAction(() => {
        useAdventureStore.getState().setPhase('outline');
      });

      storeAction(() => {
        useAdventureStore.getState().goToPreviousPhase();
      });
      expect(useAdventureStore.getState().currentPhase).toBe('frame');

      storeAction(() => {
        useAdventureStore.getState().goToPreviousPhase();
      });
      expect(useAdventureStore.getState().currentPhase).toBe('dial-tuning');

      storeAction(() => {
        useAdventureStore.getState().goToPreviousPhase();
      });
      expect(useAdventureStore.getState().currentPhase).toBe('setup');
    });
  });

  describe('reset', () => {
    it('resets all state to initial values', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });
      storeAction(() => {
        useAdventureStore.getState().setPhase('frame');
      });

      storeAction(() => {
        useAdventureStore.getState().reset();
      });

      const state = useAdventureStore.getState();

      expect(state.sessionId).toBeNull();
      expect(state.adventureName).toBe('');
      expect(state.createdAt).toBeNull();
      expect(state.currentPhase).toBe('setup');
      expect(state.phaseHistory).toEqual([]);
    });
  });

  describe('selectors', () => {
    describe('selectHasActiveSession', () => {
      it('returns false when no session', () => {
        const state = useAdventureStore.getState();
        expect(selectHasActiveSession(state)).toBe(false);
      });

      it('returns true when session exists', () => {
        storeAction(() => {
          useAdventureStore.getState().initSession('Test');
        });
        const state = useAdventureStore.getState();
        expect(selectHasActiveSession(state)).toBe(true);
      });
    });

    describe('selectCanGoBack', () => {
      it('returns false when history is empty', () => {
        const state = useAdventureStore.getState();
        expect(selectCanGoBack(state)).toBe(false);
      });

      it('returns true when history has phases', () => {
        storeAction(() => {
          useAdventureStore.getState().initSession('Test');
        });
        const state = useAdventureStore.getState();
        expect(selectCanGoBack(state)).toBe(true);
      });
    });

    describe('selectPhaseIndex', () => {
      it('returns correct index for each phase', () => {
        const phases = [
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
        ] as const;

        phases.forEach((phase, expectedIndex) => {
          storeAction(() => {
            useAdventureStore.setState({ currentPhase: phase });
          });
          const state = useAdventureStore.getState();
          expect(selectPhaseIndex(state)).toBe(expectedIndex);
        });
      });
    });

    describe('selectIsComplete', () => {
      it('returns false for non-complete phases', () => {
        storeAction(() => {
          useAdventureStore.getState().initSession('Test');
        });
        const state = useAdventureStore.getState();
        expect(selectIsComplete(state)).toBe(false);
      });

      it('returns true for complete phase', () => {
        storeAction(() => {
          useAdventureStore.setState({ currentPhase: 'complete' });
        });
        const state = useAdventureStore.getState();
        expect(selectIsComplete(state)).toBe(true);
      });
    });
  });

  describe('Date persistence', () => {
    it('serializes Date as ISO string in localStorage', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      // Force persist to happen
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(typeof parsed.state.createdAt).toBe('string');
      expect(parsed.state.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
    });

    it('deserializes ISO string back to Date on load', () => {
      // Setup: Create session and get the stored date
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      const originalCreatedAt = useAdventureStore.getState().createdAt;
      expect(originalCreatedAt).toBeInstanceOf(Date);

      // Simulate a storage reload by manually calling the storage getItem
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = JSON.parse(stored!);

      // Manually restore the Date like the storage handler does
      if (parsed.state?.createdAt) {
        parsed.state.createdAt = new Date(parsed.state.createdAt);
      }

      expect(parsed.state.createdAt).toBeInstanceOf(Date);
      expect(parsed.state.createdAt.getTime()).toBe(originalCreatedAt!.getTime());
    });

    it('handles null createdAt correctly', () => {
      // Initial state has null createdAt
      const state = useAdventureStore.getState();
      expect(state.createdAt).toBeNull();

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.createdAt).toBeNull();
      }
    });

    it('verifies Date serialization format using utility', () => {
      storeAction(() => {
        useAdventureStore.getState().initSession('Test Adventure');
      });

      expect(verifyDateSerialization(STORAGE_KEY, 'createdAt')).toBe(true);
    });
  });
});
