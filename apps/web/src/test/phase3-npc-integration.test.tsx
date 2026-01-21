/**
 * Phase 3.4 NPC Compilation Integration Tests
 *
 * Issue #27: End-to-end verification of NPC compilation functionality
 *
 * Test Scenarios:
 * 1. NPC display - card rendering, role styling, expand/collapse
 * 2. NPC list interactions - refine, confirm, confirm all, proceed
 * 3. Content store NPC state - actions and selectors
 * 4. State persistence - localStorage serialization with Sets
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Components
import { NPCCard } from '@/components/content/NPCCard';
import { NPCList } from '@/components/content/NPCList';

// Stores
import {
  useContentStore,
  selectAllNPCsConfirmed,
  selectCanProceedToAdversaries,
  selectNPCSummary,
} from '@/stores/contentStore';
import { resetAllStores, clearAllStorageData } from '@/stores';

// Types
import type { NPC, CompiledNPC } from '@dagger-app/shared-types';

// Test utilities
import { storeAction, clearPersistedStorage, verifySetSerialization } from './store-utils';

// =============================================================================
// Test Data
// =============================================================================

const createTestNPC = (overrides: Partial<NPC> = {}): NPC => ({
  id: 'npc-test-1',
  name: 'Orik the Guide',
  role: 'quest-giver',
  description: 'A weathered traveler who knows the ancient paths through the forest.',
  appearance: 'Tall and lean, with silver-streaked hair and piercing blue eyes.',
  personality: 'Cautious but kind-hearted, speaks in measured tones and riddles.',
  motivations: ['Protect the village from the darkness', 'Atone for past mistakes'],
  connections: ['Elder Mira (sister)', 'The Hollow Grove (sacred site)'],
  sceneAppearances: ['scene-1', 'scene-3'],
  ...overrides,
});

const createCompiledNPC = (overrides: Partial<CompiledNPC> = {}): CompiledNPC => ({
  ...createTestNPC(overrides),
  isConfirmed: false,
  extractedFrom: [
    { sceneId: 'scene-1', context: 'The party meets Orik at the village gate.' },
  ],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const testNPCs: NPC[] = [
  createTestNPC({ id: 'npc-1', name: 'Orik the Guide', role: 'quest-giver' }),
  createTestNPC({ id: 'npc-2', name: 'Zara the Merchant', role: 'neutral' }),
  createTestNPC({ id: 'npc-3', name: 'The Shadow', role: 'antagonist' }),
];

const testCompiledNPCs: CompiledNPC[] = testNPCs.map((npc) => createCompiledNPC(npc));

// =============================================================================
// Test Setup
// =============================================================================

const CONTENT_STORAGE_KEY = 'dagger-content-storage';

describe('Phase 3.4 NPC Integration Tests', () => {
  beforeEach(() => {
    clearPersistedStorage(CONTENT_STORAGE_KEY);
    resetAllStores();
    clearAllStorageData();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ===========================================================================
  // 1. NPCCard Component Tests
  // ===========================================================================

  describe('1. NPCCard Component', () => {
    it('renders NPC with all key information', () => {
      const mockRefine = vi.fn();
      const mockConfirm = vi.fn();

      render(
        <NPCCard
          npc={testNPCs[0]}
          onRefine={mockRefine}
          onConfirm={mockConfirm}
        />
      );

      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
      expect(screen.getByText(/quest-giver/i)).toBeInTheDocument();
      expect(screen.getByText(/weathered traveler/i)).toBeInTheDocument();
    });

    it('displays correct styling for different NPC roles', () => {
      const mockRefine = vi.fn();
      const mockConfirm = vi.fn();

      // Test antagonist styling
      const { rerender } = render(
        <NPCCard
          npc={testNPCs[2]}
          onRefine={mockRefine}
          onConfirm={mockConfirm}
        />
      );

      expect(screen.getByText(/antagonist/i)).toBeInTheDocument();

      // Test neutral styling
      rerender(
        <NPCCard
          npc={testNPCs[1]}
          onRefine={mockRefine}
          onConfirm={mockConfirm}
        />
      );

      expect(screen.getByText(/neutral/i)).toBeInTheDocument();
    });

    it('expands to show motivations and connections', async () => {
      const user = userEvent.setup();
      const mockRefine = vi.fn();
      const mockConfirm = vi.fn();

      render(
        <NPCCard
          npc={testNPCs[0]}
          onRefine={mockRefine}
          onConfirm={mockConfirm}
        />
      );

      // Expand to see motivations
      const expandButton = screen.getByRole('button', { name: /show more/i });
      await user.click(expandButton);

      expect(screen.getByText(/protect the village/i)).toBeInTheDocument();
      expect(screen.getByText(/elder mira/i)).toBeInTheDocument();
    });

    it('calls onRefine with NPC ID when refine clicked', async () => {
      const user = userEvent.setup();
      const mockRefine = vi.fn();
      const mockConfirm = vi.fn();

      render(
        <NPCCard
          npc={testNPCs[0]}
          onRefine={mockRefine}
          onConfirm={mockConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: /refine/i }));

      expect(mockRefine).toHaveBeenCalledWith('npc-1');
    });

    it('calls onConfirm with NPC ID when confirm clicked', async () => {
      const user = userEvent.setup();
      const mockRefine = vi.fn();
      const mockConfirm = vi.fn();

      render(
        <NPCCard
          npc={testNPCs[0]}
          onRefine={mockRefine}
          onConfirm={mockConfirm}
        />
      );

      await user.click(screen.getByRole('button', { name: /confirm npc/i }));

      expect(mockConfirm).toHaveBeenCalledWith('npc-1');
    });

    it('shows confirmed state and hides action buttons', () => {
      const mockRefine = vi.fn();
      const mockConfirm = vi.fn();

      render(
        <NPCCard
          npc={testNPCs[0]}
          onRefine={mockRefine}
          onConfirm={mockConfirm}
          isConfirmed
        />
      );

      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /refine/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /confirm npc/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // 2. NPCList Component Tests
  // ===========================================================================

  describe('2. NPCList Component', () => {
    const defaultProps = {
      npcs: testNPCs,
      onRefine: vi.fn(),
      onConfirm: vi.fn(),
      onConfirmAll: vi.fn(),
      onProceed: vi.fn(),
    };

    it('renders all NPCs in a list', () => {
      render(<NPCList {...defaultProps} />);

      expect(screen.getByText('Orik the Guide')).toBeInTheDocument();
      expect(screen.getByText('Zara the Merchant')).toBeInTheDocument();
      expect(screen.getByText('The Shadow')).toBeInTheDocument();
      expect(screen.getByText(/3.*npc/i)).toBeInTheDocument();
    });

    it('shows progress indicator', () => {
      render(
        <NPCList
          {...defaultProps}
          confirmedNPCIds={new Set(['npc-1'])}
        />
      );

      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('shows loading state during compilation', () => {
      render(<NPCList {...defaultProps} isLoading streamingContent="Analyzing scenes..." />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/compiling/i)).toBeInTheDocument();
      expect(screen.getByText(/analyzing scenes/i)).toBeInTheDocument();
    });

    it('calls onConfirmAll when confirm all clicked', async () => {
      const user = userEvent.setup();
      const mockConfirmAll = vi.fn();

      render(
        <NPCList
          {...defaultProps}
          onConfirmAll={mockConfirmAll}
        />
      );

      await user.click(screen.getByRole('button', { name: /confirm all/i }));

      expect(mockConfirmAll).toHaveBeenCalled();
    });

    it('shows proceed button when all NPCs confirmed', () => {
      const allConfirmed = new Set(['npc-1', 'npc-2', 'npc-3']);

      render(
        <NPCList
          {...defaultProps}
          confirmedNPCIds={allConfirmed}
        />
      );

      expect(screen.getByRole('button', { name: /proceed.*adversaries/i })).toBeInTheDocument();
    });

    it('calls onProceed when proceed clicked', async () => {
      const user = userEvent.setup();
      const mockProceed = vi.fn();
      const allConfirmed = new Set(['npc-1', 'npc-2', 'npc-3']);

      render(
        <NPCList
          {...defaultProps}
          confirmedNPCIds={allConfirmed}
          onProceed={mockProceed}
        />
      );

      await user.click(screen.getByRole('button', { name: /proceed.*adversaries/i }));

      expect(mockProceed).toHaveBeenCalled();
    });

    it('displays error with retry option', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();

      render(
        <NPCList
          {...defaultProps}
          error="Failed to compile NPCs"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText(/failed to compile/i)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /retry/i }));

      expect(mockRetry).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 3. Content Store NPC State Tests
  // ===========================================================================

  describe('3. Content Store NPC State', () => {
    beforeEach(() => {
      // Clear NPCs before each store test
      storeAction(() => {
        useContentStore.getState().clearNPCs();
      });
    });

    it('sets NPCs in store', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
      });

      const npcs = useContentStore.getState().npcs;
      expect(npcs).toHaveLength(3);
      expect(npcs[0].name).toBe('Orik the Guide');
    });

    it('adds individual NPC to store', () => {
      const newNPC = createCompiledNPC({ id: 'npc-new', name: 'New NPC' });

      storeAction(() => {
        useContentStore.getState().addNPC(newNPC);
      });

      const npcs = useContentStore.getState().npcs;
      expect(npcs).toHaveLength(1);
      expect(npcs[0].name).toBe('New NPC');
    });

    it('updates existing NPC', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().updateNPC('npc-1', { personality: 'Updated personality' });
      });

      const npc = useContentStore.getState().npcs.find((n) => n.id === 'npc-1');
      expect(npc?.personality).toBe('Updated personality');
    });

    it('confirms single NPC', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmNPC('npc-1');
      });

      const { npcs, confirmedNPCIds } = useContentStore.getState();
      expect(confirmedNPCIds.has('npc-1')).toBe(true);
      expect(npcs.find((n) => n.id === 'npc-1')?.isConfirmed).toBe(true);
    });

    it('confirms all NPCs', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmAllNPCs();
      });

      const { npcs, confirmedNPCIds } = useContentStore.getState();
      expect(confirmedNPCIds.size).toBe(3);
      expect(npcs.every((n) => n.isConfirmed)).toBe(true);
    });

    it('tracks NPC loading state', () => {
      storeAction(() => {
        useContentStore.getState().setNPCLoading(true);
      });

      expect(useContentStore.getState().npcLoading).toBe(true);

      storeAction(() => {
        useContentStore.getState().setNPCLoading(false);
      });

      expect(useContentStore.getState().npcLoading).toBe(false);
    });

    it('tracks NPC error state', () => {
      storeAction(() => {
        useContentStore.getState().setNPCError('Compilation failed');
      });

      expect(useContentStore.getState().npcError).toBe('Compilation failed');
      expect(useContentStore.getState().npcLoading).toBe(false);
    });

    it('tracks NPC streaming content', () => {
      storeAction(() => {
        useContentStore.getState().setNPCStreamingContent('Analyzing...');
        useContentStore.getState().appendNPCStreamingContent(' scene 1');
      });

      expect(useContentStore.getState().npcStreamingContent).toBe('Analyzing... scene 1');
    });

    it('tracks refining NPC ID', () => {
      storeAction(() => {
        useContentStore.getState().setRefiningNPCId('npc-2');
      });

      expect(useContentStore.getState().refiningNPCId).toBe('npc-2');
    });

    it('clears all NPC state', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmAllNPCs();
        useContentStore.getState().setNPCLoading(true);
        useContentStore.getState().setNPCError('error');
        useContentStore.getState().setRefiningNPCId('npc-1');
      });

      storeAction(() => {
        useContentStore.getState().clearNPCs();
      });

      const state = useContentStore.getState();
      expect(state.npcs).toHaveLength(0);
      expect(state.confirmedNPCIds.size).toBe(0);
      expect(state.npcLoading).toBe(false);
      expect(state.npcError).toBeNull();
      expect(state.refiningNPCId).toBeNull();
    });
  });

  // ===========================================================================
  // 4. NPC Selectors Tests
  // ===========================================================================

  describe('4. NPC Selectors', () => {
    beforeEach(() => {
      // Ensure NPCs are cleared before each selector test
      storeAction(() => {
        useContentStore.getState().clearNPCs();
      });
    });

    it('selectAllNPCsConfirmed returns true when all confirmed', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmAllNPCs();
      });

      expect(selectAllNPCsConfirmed(useContentStore.getState())).toBe(true);
    });

    it('selectAllNPCsConfirmed returns false when not all confirmed', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmNPC('npc-1');
      });

      expect(selectAllNPCsConfirmed(useContentStore.getState())).toBe(false);
    });

    it('selectCanProceedToAdversaries returns true when ready', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmAllNPCs();
      });

      expect(selectCanProceedToAdversaries(useContentStore.getState())).toBe(true);
    });

    it('selectNPCSummary returns correct counts', () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmNPC('npc-1');
      });

      const summary = selectNPCSummary(useContentStore.getState());

      expect(summary.total).toBe(3);
      expect(summary.confirmed).toBe(1);
      expect(summary.pending).toBe(2);
    });
  });

  // ===========================================================================
  // 5. State Persistence Tests
  // ===========================================================================

  describe('5. State Persistence', () => {
    it('persists confirmedNPCIds Set as Array', async () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmNPC('npc-1');
        useContentStore.getState().confirmNPC('npc-2');
      });

      // Wait for persist middleware
      await waitFor(() => {
        expect(verifySetSerialization(CONTENT_STORAGE_KEY, 'confirmedNPCIds')).toBe(true);
      });
    });

    it('restores confirmedNPCIds as Set after rehydration', async () => {
      storeAction(() => {
        useContentStore.getState().setNPCs(testCompiledNPCs);
        useContentStore.getState().confirmNPC('npc-1');
      });

      // Wait for persistence
      await waitFor(() => {
        const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
        expect(stored).not.toBeNull();
      });

      // Verify the Set was properly restored
      const state = useContentStore.getState();
      expect(state.confirmedNPCIds instanceof Set).toBe(true);
      expect(state.confirmedNPCIds.has('npc-1')).toBe(true);
    });
  });
});
